/*!
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require("fs");
const fsp = fs.promises;

const fg = require("fast-glob");

const postcss = require("postcss");
const valueParser = require("postcss-value-parser");

module.exports = (_opts = {}) => {
	return {
		postcssPlugin: "postcss-custom-properties-mapping",
		async prepare() {
			const staticVars = {};
			const allVars = {};

			// Read in all static vars
			for (const filename of await fg([
				"globals/spectrum-staticAliases.css",
				"globals/spectrum-fontGlobals.css",
				"globals/spectrum-fontGlobals.css",
				"globals/spectrum-dimensionGlobals.css",
				"globals/spectrum-colorGlobals.css",
				"globals/spectrum-animationGlobals.css",
			])) {
				const content = await fsp.readFile(filename, "utf8");
				postcss.parse(content).then((root) => {
					root.walkDecls((decl) => (staticVars[decl.prop] = decl.value));
				});
			}

			// Read in all variables so we have the value they resolve to
			for (const filename of await fg([
				`${varDir}/css/components/*.css`,
				`${varDir}/css/globals/*.css`,
				`${varDir}/custom.css`,
			])) {
				const content = await fsp.readFile(filename, "utf8");
				postcss.parse(content).then((root) => {
					root.walkDecls((decl) => (allVars[decl.prop] = decl.value));
				});
			}

			return {
				Declaration(decl, {}) {
					if (!/(^|[^\w-])var\([\W\w]+\)/.test(decl.value)) return;
					const value = valueParser(decl.value);

					if (value.nodes && value.nodes[0] && value.nodes[0].value === "url") {
						// Don't process custom properties within URLs, it does nothing and breaks parcel
						// see https://github.com/parcel-bundler/parcel/issues/3881
						return;
					}

					value.walk((node, index, nodes) => {
						if (node.type === "function" && node.value === "var") {
							let v = node.nodes[0].value;

							// If the value is static, replace the variable with the value.
							// Otherwise, change the variable name to the mapped name.
							if (staticVars[v]) {
								nodes.splice(
									index,
									1,
									...valueParser(`var(${v}, ${staticVars[v]})`).nodes
								);
							} else if (allVars[v]) {
								nodes.splice(
									index,
									1,
									...valueParser(`var(${v}, ${allVars[v]})`).nodes
								);
							}
						}
					});

					decl.value = value.toString();
				},
			};
		},
	};
};
