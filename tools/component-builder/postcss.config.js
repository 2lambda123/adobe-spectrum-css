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
const path = require("path");

const fg = require("fast-glob");
const postcss = require("postcss");

const varDir = path.dirname(
	require.resolve("@spectrum-css/vars/package.json", {
		paths: [process.cwd(), path.join(process.cwd(), "../../")],
	})
);

/**
 * Compile a map of all variables and their values defined in the provided CSS
 * @param {import('postcss').Root} root
 * @param {Map<string, string>} [variableMap=new Map()] - an existing map of variable names to values
 * @returns {Map<string, string>} variableMap - map of variable names to values
 */
function getVarsDefined(root, variableMap = new Map()) {
	/** @todo should we include an ignorelist here? */
	root.walkDecls(/^--/, (decl) => {
		variableMap.set(decl.prop, decl.value);
	});

	return variableMap;
}

/**
 *
 * @param {string|string[]} from
 * @returns {Promise<Map<string, string>>} variableMap - map of variable names to values
 */
function readVariablesFromFiles(from, { cwd = varDir } = {}) {
	const files = fg.sync(from, { cwd, absolute: true });

	let variableMap = new Map();
	files.map(async (file) => {
		const contents = fs.readFileSync(file, "utf-8");
		const root = postcss.parse(contents);
		variableMap = getVarsDefined(root, variableMap);
	});

	return variableMap;
}

/**
 * @typedef {Object} PostCSSOptions
 * @property {string} [cwd=] - the current working directory
 * @property {boolean} [verbose=false] - whether to log verbose output
 * @property {boolean} [varsOnly=false] - whether to only output variables
 * @property {(RegExp|string)[]} [ignoreList=[]] - a list of patterns to ignore when looking for variables
 */

/** @type {import('postcss-load-config').ConfigFn} */
module.exports = (options = {}) => {
	const {
		cwd = process.cwd(),
		verbose = false,
		varsOnly = false,
		ignoreList = [/^--mod/, /^--highcontrast/]
	} = options;

	// Read in all static vars
	const staticVars = readVariablesFromFiles(["dist/globals/*.css"]) ?? {};

	// Read in all variables so we have the value they resolve to
	const allVars = readVariablesFromFiles([
		`dist/components/*.css`,
		`dist/globals/*.css`,
		`dist/*.css`,
	]) ?? {};

	// Get vars in ALL components + all static vars
	const tokens = readVariablesFromFiles([
		`index.css`,
	], {
		cwd: path.dirname(
			require.resolve("@spectrum-css/tokens/package.json", {
				paths: [process.cwd(), path.join(process.cwd(), "../../")],
			})
		),
	});

	tokens.forEach((value, name) => {
		// Prefer the component's vars over the theme's vars
		if (allVars.has(name)) return;
		allVars.set(name, value);
	});

	return {
		...options,
		plugins: [
			require("postcss-import")({
				root: cwd,
				addModulesDirectories: [path.join(cwd, "node_modules"), path.join(__dirname, "node_modules")],
			}),
			require("postcss-nested")({
				preserveEmpty: false,
				rootRuleName: ".spectrum",
			}),
			require("postcss-inherit")({}),
			require("postcss-logical")(),
			require("postcss-transform-logical")(),
			require("postcss-notnested")({ replace: ".spectrum" }),
			require("postcss-droproot")(),
			require("postcss-notnested")({}), // Second one to catch all stray &
			...(varsOnly ? [require("postcss-vars-only")({ globalVars: allVars, ignoreList, verbose })] : []),
			require("postcss-custom-properties-mapping")({ allVars, staticVars }),
			require("postcss-dropunusedvars")({ fix: false }),
			require("postcss-dropdupedvars")({ fix: false }),
			require("postcss-dir-pseudo-class")(),
			require("postcss-discard-empty")(),
			require("postcss-discard-comments")({ removeAllButFirst: true }),
			require("autoprefixer")({}),
			...(verbose ? [require("postcss-reporter")({
				clearReportedMessages: true,
			})] : []),
		],
	};
};
