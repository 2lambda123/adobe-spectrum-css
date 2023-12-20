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

const { plugins = [] } = require("../postcss.config");

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

function getVarsFromCSS(css) {
	const variableList = new Set();

	postcss.parse(css).walkDecls((decl) => {
		const matches = decl.value.match(/var\(.*?\)/g);
		if (!matches) return;

		matches.forEach((match) => {
			const varName = match.replace(/var\((--[\w\-]+),?.*?\)/, "$1").trim();
			variableList.add(varName);
		});
	});

	return [...variableList];
}

function getClassNames(contents, pkgName) {
	if (pkgName === "page") return [];

	const classNames = new Set();
	postcss.parse(contents).walkRules((rule) => {
		rule.selectors.forEach((fullSelector) => {
			// Skip compound selectors, they may not start with the component itself
			if (fullSelector.match(/~|\+/)) return true;

			const selector = fullSelector.split(" ").shift();
			const matches = selector.match(/^\.spectrum-[\w]+/);
			if (matches) classNames.add(matches[0]);
		});
	});

	if (classNames.size === 0) {
		console.log(
			`Could not find classNames for ${pkgName}, assuming no classNames`
		);
		return [];
	}

	return [...classNames];
}

function getVarsDefinedInCSS(css) {
	const variableList = {};

	postcss.parse(css).walkDecls(/^--/, (decl) => {
		variableList[decl.prop] = decl.value;
	});

	return variableList;
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

function bakeVars() {
	const cwd = process.cwd();

	if (!fs.existsSync(path.join(cwd, "dist/index-vars.css"))) return;

	const contents = fs.readFileSync(path.join(cwd, "dist/index-vars.css"), "utf8");

	const { name } = require(path.join(cwd, "package.json"));
	const pkgName = name?.split("/").pop();
	const logWarnings = !["site", "page"].includes(pkgName);

	const classNames = getClassNames(contents, pkgName);

	// Find all custom properties used in the component
	const usedVariables = getVarsFromCSS(contents);

	// Get vars defined inside of the component
	const definedVariables = getVarsDefinedInCSS(contents);

	// Get vars in ALL components + all static vars
	const vars = readVariables([
		`css/components/*.css`,
		`css/globals/*.css`,
		`custom.css`,
	]);

	if (!vars) return;

	const varNames = Object.keys(vars);
	if (varNames.length === 0) return;

	// Get literally all of the possible vars (even overridden vars that are different between themes/scales)
	// @todo: do we need coreTokensFile?
	const allVars = {
		...vars,
		...readVariables([
			`css/themes/*.css`,
			`css/scales/*.css`,
		]),
	};

	const usedVars = {};
	usedVariables.forEach((varName) => {
		if (
			varName.startsWith("--mod") ||
			varName.startsWith("--highcontrast")
		) return;

		if (!Object.keys(definedVariables).includes(varName)) {
			if (!allVars[varName] && logWarnings) {
				console.warn(`🔴 ${pkgName} uses undefined variable ${varName}`);
			}
			if (vars[varName]) usedVars[varName] = vars[varName];
			else if (allVars[varName]) usedVars[varName] = allVars[varName];
		} else if (definedVariables[varName]) {
			usedVars[varName] = definedVariables[varName];
		}
	});

	Object.entries(usedVars).forEach(([varName, varValue]) => {
		if (!varValue || varValue === "undefined") {
			console.warn(`🔴 ${pkgName} uses undefined variable ${varName}`);
			delete usedVars[varName];
		}
	});

	if (!fs.existsSync(path.join(cwd, "dist"))) {
		fs.mkdirSync(path.join(cwd, "dist"));
	}

	return fs.writeFileSync(path.join(cwd, "dist/vars.css"), `\n${classNames.map((className) => `${className}`).join(",\n")} {\n${Object.entries(usedVars).map(([varName, varValue]) => `  ${varName}: ${varValue};`).join("\n")}\n}\n`, "utf8");
}

async function buildIndexVars() {
	const cwd = process.cwd();

	if (!fs.existsSync(path.join(cwd, "index.css"))) return;

	const indexCSS = fs.readFileSync(path.join(cwd, "index.css"), "utf8");
	return postcss(plugins).process(indexCSS, {
		from: "index.css",
	}).then((result) => {
		if (!fs.existsSync(path.join(cwd, "dist"))) {
			fs.mkdirSync(path.join(cwd, "dist"));
		}

		fs.writeFileSync(path.join(cwd, "dist/index-vars.css"), result.css);

		if (result.map) {
			fs.writeFileSync(path.join(cwd, "dist/index-vars.css.map"), result.map);
		}
	});
}

async function buildVars() {
	return buildIndexVars().then(() => {
		bakeVars();
	});
}

async function buildCSS() {
	return buildVars().then(() => {
		const cwd = process.cwd();

		if (!fs.existsSync(path.join(cwd, "dist/index-vars.css"))) return;
		// Copy index.vars as index.css to maintain backwards compat
		fs.copyFileSync(path.join(cwd, "dist/index-vars.css"), "dist/index.css");
	});
}

exports.buildIndexVars = buildIndexVars;
exports.buildVars = buildVars;
exports.buildCSS = buildCSS;
