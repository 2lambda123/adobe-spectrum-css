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

const { readFileSync } = require("fs");
const { join, dirname } = require("path");

const fg = require("fast-glob");
const postcss = require("postcss");

const tokenDir = dirname(
	require.resolve("@spectrum-css/tokens/package.json", {
		paths: [process.cwd(), __dirname],
	})
);

module.exports = ({
	cwd = process.cwd(),
	verbose = true,
	splitinatorOptions = {
		noSelectors: false,
		noFlatVariables: false,
	},
	checkUnused = true,
	additionalPlugins = [],
	...options
} = {}) => {
	const tokens = new Map();

	// We can only iterate over the files if we have a tokenDir to look in
	if (tokenDir) {
		const files = fg.sync([`index.css`], {
			cwd: tokenDir,
			absolute: true
		});

		files.map((file) => {
			const contents = readFileSync(file, "utf-8");

			/** @todo should we include an ignorelist here? */
			postcss.parse(contents).walkDecls(/^--/, (decl) => {
				tokens.set(decl.prop, decl.value);
			});
		});
	}

	return {
		...options,
		plugins: [
			require("postcss-import")({
				root: cwd,
				addModulesDirectories: [join(cwd, "node_modules"), join(__dirname, "node_modules")],
			}),
			require("postcss-extend"),
			require("postcss-nested"),
			require("postcss-splitinator")({
				processIdentifier: (identifier) => identifier === "express" ? "spectrum--express" : identifier,
				...splitinatorOptions,
			}),
			require("postcss-hover-media-feature"),
			require("postcss-calc"),
			...additionalPlugins,
			...(checkUnused ? [require("postcss-dropunusedvars")({
				fix: false,
			})] : []),
			require("postcss-dropdupedvars"),
			require("postcss-discard-empty"),
			require("at-rule-packer"),
			require("postcss-discard-comments")({ removeAllButFirst: true }),
			require("autoprefixer")({}),
			require("postcss-reporter")({
				clearReportedMessages: true,
			}),
		],
	};
};
