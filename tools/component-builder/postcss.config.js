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

function getVarValues(css) {
	const variables = {};
	postcss.parse(css).walkDecls((decl) => {
		variables[decl.prop] = decl.value;
	});
	return variables;
}

function readVariables(from) {
	const files = fg.sync(from, {
		cwd: varDir,
		absolute: true,
	});

	const variableList = {};
	for (const file of files) {
		const css = fs.readFileSync(file, "utf-8");
		const vars = getVarValues(css);
		Object.entries(vars).forEach(([key, value]) => {
			variableList[key] = value;
		});
	}

	return variableList;
}

function fetchVars() {
	// Read in all static vars
	const staticVars = readVariables([
		"css/globals/spectrum-staticAliases.css",
		"css/globals/spectrum-fontGlobals.css",
		"css/globals/spectrum-fontGlobals.css",
		"css/globals/spectrum-dimensionGlobals.css",
		"css/globals/spectrum-colorGlobals.css",
		"css/globals/spectrum-animationGlobals.css"
	]) ?? {};

	// Read in all variables so we have the value they resolve to
	const allVars = readVariables([
		`css/components/*.css`,
		`css/globals/*.css`,
		`custom.css`,
	]) ?? {};

	return { staticVars, allVars };
}


module.exports = ({ cwd, ...options }) => {
	if (!cwd) cwd = process.cwd();
	return {
		...options,
		plugins: [
			require("postcss-import")({
				root: cwd,
				addModulesDirectories: [path.join(cwd, "node_modules"), path.join(__dirname, "node_modules")],
			}),
			require("postcss-nested")(),
			require("postcss-inherit")(),
			require("postcss-logical")(),
			require("postcss-transform-logical")(),
			require("postcss-dir-pseudo-class")(),
			require("postcss-custom-properties-mapping")(fetchVars()),
			require("postcss-notnested")({ replace: ".spectrum" }),
			require("postcss-dropunusedvars")({ fix: true }),
			require("postcss-dropdupedvars")({ fix: true }),
			require("postcss-droproot")(),
			require("postcss-notnested")(), // Second one to catch all stray &
			require("postcss-discard-empty")(),
			require("postcss-discard-comments")({ removeAllButFirst: true }),
			require("autoprefixer")({}),
			require("postcss-reporter")({
				clearReportedMessages: true,
			}),
		],
	};
};
