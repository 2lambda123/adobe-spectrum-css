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

const valueParser = require("postcss-value-parser");

module.exports = function ({
	staticVars = {},
	allVars = {},
}) {
	return {
		postcssPlugin: "postcss-custom-properties-mapping",
		Declaration(decl) {
			// match custom property inclusions
			if (!/(^|[^\w-])var\([\W\w]+\)/.test(decl.value)) {
				return;
			}

			const value = valueParser(decl.value);

			// Don't process custom properties within URLs, it does nothing and breaks parcel
			// see https://github.com/parcel-bundler/parcel/issues/3881
			if (!value || !value.nodes || value.nodes.length === 0 || value.nodes[0].value === "url") {
				return;
			}

			value.walk((node, index, nodes) => {
				if (node.type !== "function" || node.value !== "var") {
					return;
				}

				const v = node.nodes[0].value;

				// If the value is static, replace the variable with the value.
				// Otherwise, change the variable name to the mapped name.
				if (staticVars[v]) {
					nodes.splice(
						index,
						1,
						...valueParser(`var(${v}, ${staticVars[v]})`).nodes
					);

					return;
				}

				if (allVars[v]) {
					nodes.splice(
						index,
						1,
						...valueParser(`var(${v}, ${allVars[v]})`).nodes
					);
				}
			});

			decl.assign({
				value: valueParser.stringify(value),
			});
		},
	};
};

module.exports.postcss = true;
