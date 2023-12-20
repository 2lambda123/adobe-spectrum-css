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

module.exports = function ({ replace } = {}) {
	return {
		postcssPlugin: "postcss-notnested",
		Rule(rule) {
			if (!rule.selectors || rule[processed]) return;
			rule[processed] = true;

			if (replace) {
				let replaced = false;
				let selectors = rule.selectors.map((selector) => {
					// Match ampersands at the start of a given selector
					if (/^&/.test(selector)) {
						replaced = true;

						// Handle special case where the replacement selector === the existing selector
						if (selector.replace(/^&/, "") === replace) {
							return replace;
						}

						return selector.replace(/^&/, replace);
					} else return selector;
				});

				if (!replaced) return;

				// De-dupe selectors
				selectors = selectors.filter((selector, index) =>
					selectors.indexOf(selector) === index
				);

				rule.selectors = selectors;

				return;
			}

			const selectors = rule.selectors.filter((selector) => {
				// Kill the selector with the stray ampersand -- it's not nested!
				return !/^&/.test(selector);
			});

			// If no selectors remain, remove the rule completely
			if (selectors.length == 0) {
				rule.remove();
				return;
			}

			// Only replace the selectors if we changed something (avoids extra work for every selector)
			if (selectors.length != rule.selectors.length) {
				rule.selectors = selectors;
			}
		},
	};
};

module.exports.postcss = true;
