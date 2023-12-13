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

/**
 * Fetches the component's folder name from the file path or returns undefined if not found
 * @param {string} filePath
 * @returns {string|undefined}
 */
function getPackageFromPath(filePath) {
	return filePath?.match(`(components|@spectrum-css)/(.*?)/`)?.[2];
}

module.exports = ({ from, file, cwd, env = "development", options = {} }) => {
	const packageName = getPackageFromPath(from ?? file);
	const isProduction = Boolean(env === "production");

	if (!options.map) {
		options.map = !isProduction ? { inline: false } : false;
	}

	return {
		...options,
		plugins: {
			"postcss-import": {
				root: join(cwd, packageName),
				addModulesDirectories: [
					join(cwd, "node_modules"),
					join(cwd, packageName, "node_modules"),
					join(__dirname, "node_modules"),
				],
			},
			"postcss-nested": {},
			/**
			 * @link https://github.com/csstools/postcss-extend-rule
			 * @note replacement for postcss-inherit
			 */
			"postcss-extend-rule": {
				onRecursiveExtend: "throw",
			},
			"postcss-logical": {},
			"./tasks/legacy-plugins/postcss-transform-logical": {},
			"postcss-dir-pseudo-class": {},
			"./tasks/legacy-plugins/postcss-notnested": {
				replace: ".spectrum"
			},
			"./tasks/legacy-plugins/legacy-postcss-dropunusedvars": { fix: false },
			"./tasks/legacy-plugins/legacy-postcss-dropdupedvars": {},
			"postcss-droproot": {},
			// Second one to catch all stray &
			"./tasks/legacy-plugins/postcss-notnested": {},
			"postcss-discard-empty": {},
			"postcss-discard-comments": {
				removeAllButFirst: true
			},
			autoprefixer: {
				quiet: true,
			},
			"postcss-reporter": !isProduction
				? {
					clearReportedMessages: true,
				}
				: false,
		},
	};
};
