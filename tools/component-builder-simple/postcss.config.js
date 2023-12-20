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

const { join } = require("path");

module.exports = ({
	cwd,
	splitinatorOptions = {},
	additionalPlugins = [],
	...options
}) => {
	if (!cwd) cwd = process.cwd();
	return {
		...options,
		plugins: [
			require("postcss-import")({
				root: cwd,
				addModulesDirectories: [join(cwd, "node_modules"), join(__dirname, "node_modules")],
			}),
			require("postcss-nested")(),
			require("postcss-splitinator")({
				processIdentifier: (identifier) => {
					if (identifier === "express") {
						return "spectrum--express";
					}
					return identifier;
				},
				...splitinatorOptions,
			}),
			require("postcss-inherit")(),
			require("postcss-transform-logical")(),
			...additionalPlugins,
			require("postcss-dropunusedvars")({ fix: false }),
			require("postcss-dropdupedvars")({ fix: false }),
			require("postcss-discard-empty")(),
			require("postcss-discard-comments")({ removeAllButFirst: true }),
			require("autoprefixer")({}),
			require("postcss-reporter")({
				clearReportedMessages: true,
			}),
		],
	};
};
