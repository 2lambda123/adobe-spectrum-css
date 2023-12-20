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

const processed = Symbol("processed");
const valueParser = require("postcss-value-parser");

module.exports = function ({
	staticVars = new Map(),
	allVars = new Map(),
}) {
	return {
		postcssPlugin: "postcss-custom-properties-mapping",
		Declaration(decl) {
			if (decl[processed]) return;
			decl[processed] = true;

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

			value.walk((node) => {
				if (node.type !== "function" || node.value !== "var") {
					return;
				}

				// Already has a fallback? Skip.
				if (node.nodes.length > 2) return;

				const v = node.nodes[0].value;
				let foundValue;

				// If the value is static, replace the variable with the value.
				// Otherwise, change the variable name to the mapped name.
				if (staticVars.has(v)) {
					foundValue = staticVars.get(v);
					if (Array.isArray(foundValue)) foundValue = foundValue[0];
				}

				if (!foundValue && allVars.has(v)) {
					foundValue = allVars.get(v);
					if (Array.isArray(foundValue)) foundValue = foundValue[0];
				}

				if (foundValue) {
					const newResult = valueParser(`var(${v}, ${foundValue})`);
					node.nodes.splice(0, 1, ...newResult.nodes?.[0].nodes);
					return;
				}
			}, true);

			decl.assign({
				value: valueParser.stringify(value),
			});
		},
	};
};

module.exports.postcss = true;
