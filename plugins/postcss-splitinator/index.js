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

function validateOptions(options) {
	if (typeof options.noFlatVariables !== "boolean") {
		options.noFlatVariables = false;
	}

	if (typeof options.noSelectors !== "boolean") {
		options.noSelectors = false;
	}

	if (typeof options.processIdentifier !== "function") {
		options.processIdentifier = (identifierValue) => identifierValue;
	}

	if (typeof options.getName !== "function") {
		options.getName = (selector, prop) => {
			selector = selector.replace(/^:where\((.*?)\)$/, "$1");

			// This regex is designed to pull spectrum-ActionButton out of a selector
			let baseSelectorMatch = selector.match(/^\.([a-z]+-[\A-Z][^-. ]+)/);
			if (baseSelectorMatch) {
				const [, baseSelector] = baseSelectorMatch;
				const baseSelectorRegExp = new RegExp(baseSelector, "gi");
				prop = prop.replace(baseSelectorRegExp, "");
				selector = baseSelector + selector.replace(baseSelectorRegExp, "");
			}

			selector = selector.replace(/is-/g, "");

			let selectorParts = selector.replace(/\s+/g, "").replace(/,/g, "").split(".");

			return `--${`system-${selectorParts.join("-")}-${prop.substr(2)}`.replace(/-+/g, "-")}`.toLowerCase();
		};
	}

	return options;
}

/**
 * @typedef Options
 * @property {boolean} [noFlatVariables=false] - Don't output flat variables
 * @property {boolean} [noSelectors=false] - Don't output selectors
 * @property {(identifierValue: string, identifierName?: string) => string} [processIdentifier=] - Process the identifier value
 * @property {(selector: string, prop: string) => string} [getName=] - Get the name of the variable
 */

/** @type import('postcss').PluginInitializer<Options> */
module.exports = function (options = {}) {
	const { noFlatVariables, noSelectors, processIdentifier, getName } = validateOptions(options);

	return {
		postcssPlugin: "postcss-splitinator",
		OnceExit: (root, { Rule, Declaration }) => {
			const selectorMap = new Map();

			root.walkAtRules(/container/, (container) => {
				const [, identifierName, identifierValue] = container.params.match(
					/\(\s*--(.*?)\s*[:=]\s*(.*?)\s*\)/
				);

				const rule = new Rule({
					selector: `.${processIdentifier(identifierValue, identifierName)}`,
					source: container.source,
				});

				if (!noFlatVariables) {
					container.parent.insertAfter(container, rule);
				}

				container.walkDecls(/^--/, (decl) => {
					// Process rules that match multiple selectors separately to avoid weird var names and edge cases
					// note: this doesn't support :where() and is likely brittle!
					const selectors = decl.parent.selector.split(/\s*,\s*/);
					selectors.forEach((selector) => {
						const variableName = getName(selector, decl.prop);
						const newDecl = decl.clone({
							prop: variableName,
						});
						newDecl.raws.before = "\n  ";

						if (!noFlatVariables) {
							rule.append(newDecl);
						}

						const selectorNode = selectorMap.has(selector) ? selectorMap.get(selector) : new Map();

						// Check for fallbacks
						// todo: use valueparser instead of a regex
						const fallbackMatch = decl.value.match(
							/var\(\s*(.*?)\s*,\s*var\(\s*(.*?)\s*\)\)/
						);
						if (fallbackMatch) {
							const [, override, fallback] = fallbackMatch;

							// The final declaration should have the override present
							selectorNode.set(decl.prop, `var(${override}, var(${variableName}))`);

							// The system-level declaration should only have the fallback
							newDecl.value = `var(${fallback})`;
						} else {
							selectorNode.set(decl.prop, `var(${variableName})`);
						}

						selectorMap.set(selector, selectorNode);
					});
				});

				container.remove();
			});

			if (noSelectors) return;

			for (const [selector, props] of selectorMap.entries()) {
				const rule = new Rule({
					selector,
				});

				for (const [prop, value] of props.entries()) {
					const decl = new Declaration({
						prop,
						value,
						raws: {
							before: "\n  ",
						}
					});

					rule.append(decl);
				}

				root.append(rule);
			}
		},
	};
};
