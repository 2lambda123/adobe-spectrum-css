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
const fsp = fs.promises;
const path = require("path");

const fg = require("fast-glob");
const postcss = require("postcss");
const postcssrc = require("postcss-load-config");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const dirs = {
	root: path.resolve(__dirname, "../../"),
}

const varDir = path.join(
	path.dirname(
		require.resolve("@spectrum-css/vars", {
			paths: [process.cwd(), path.join(process.cwd(), "../../")],
		})
	),
	".."
);

// const coreTokensFile = require.resolve("@spectrum-css/tokens", {
// 	paths: [process.cwd(), path.join(process.cwd(), "../../")],
// });

require("colors");

const { _: inputs = [] } = yargs(hideBin(process.argv)).argv;

function getClassNames(root, pkgName = undefined) {
	if (pkgName && pkgName === "page") return [];

	const classNames = new Set();

	root.walkRules((rule) => {
		rule.selectors.forEach((fullSelector) => {
			// Skip compound selectors, they may not start with the component itself
			if (fullSelector.match(/~|\+/)) return true;

			const selector = fullSelector.split(" ").shift();
			if (rule.type === "rule") {
				const matches = selector.match(/^\.spectrum-[\w]+/);
				if (matches) classNames.add(matches[0]);
			}
		});
	});

	return [...classNames];
}

function getVarsFromCSS(root) {
	const variableList = new Set();
	root.walkDecls((decl) => {
		const matches = decl.value.match(/var\(.*?\)/g);
		if (!matches) return;

		matches.forEach((match) => {
			if (!match || !match.trim()) return;
			variableList.add(match.replace(/var\((--[\w\-]+),?.*?\)/, "$1").trim());
		});
	});
	return [...variableList];
}

function getVarsDefinedInCSS(root) {
	const variableList = new Set();
	root.walkDecls(/^--/, (decl) => variableList.add(decl.prop));
	return [...variableList];
}

function getVarValues(root) {
	const variables = {};
	root.walkDecls((decl) => variables[decl.prop] = decl.value);
	return variables;
}

function getVarsFromFiles(globs = []) {
	const files = fg.sync(globs, {
		allowEmpty: true,
		absolute: true,
	});

	const contents = files.reduce((content, file) => {
		const css = fs.readFileSync(file, "utf-8");
		if (!css || css.length === 0) return content;
		return `${content}\n/* Source: ${file} */\n\n${css}`;
    }, "");

    const root = postcss.parse(contents);

	return getVarValues(root);
}

async function buildIndexVars(package) {
	const inputPath = path.join(dirs.root, package, "index.css");
	if (!fs.existsSync(inputPath)) return Promise.resolve();

	const contents = await fsp.readFile(inputPath, "utf-8");
	if (!contents || contents.length === 0) return;

	const { plugins, options } = await postcssrc({ cwd: package, from: inputPath }, __dirname);

	const result = await postcss(plugins).process(contents, { from: inputPath, ...options });
	if (!result.css || result.css.length === 0) return;

	const outputPath = path.join(dirs.root, package, "dist/index-vars.css");

	// Ensure the output directory exists and remove the file if it already exists
	if (!fs.existsSync(path.dirname(outputPath))) {
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	} else if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);

		// Remove the map file if it exists
		if (fs.existsSync(`${outputPath}.map`)) {
			fs.unlinkSync(`${outputPath}.map`);
		}
	}

	return Promise.all([
		buildVars(package, result.css),
		fsp.writeFile(outputPath, result.css, { encoding: "utf-8" }),
		result.map ? fsp.writeFile(`${outputPath}.map`, result.map, { encoding: "utf-8" }) : Promise.resolve(),
	]).then(() => {
		const consoleOutput = [];
		if (fs.existsSync(outputPath)) {
			consoleOutput.push(`${`✓`.green} ${outputPath.yellow} built`);
		}
		if (fs.existsSync(`${outputPath}.map`)) {
			consoleOutput.push(`${`✓`.green} ${`${outputPath}.map`.yellow} built`);
		}
		return consoleOutput;
	});
}

async function buildVars(package, content = "") {
	if (!package || !fs.existsSync(path.join(dirs.root, package, "package.json"))) return Promise.resolve();

	const { name } = require(path.join(dirs.root, package, "package.json"));
	const pkgName = name.split("/").pop();
	const root = postcss.parse(content);

	const classNames = getClassNames(root, pkgName);

	// Get vars defined inside of the component
	const componentVars = getVarsDefinedInCSS(root);

	// Get vars in ALL components
	const vars = getVarsFromFiles([
		`${varDir}/css/components/*.css`,
		`${varDir}/css/globals/*.css`,
		`${varDir}/custom.css`,
	]);

	// Get literally all of the possible vars (even overridden vars that are different between themes/scales)
	const allVars = getVarsFromFiles([
		`${varDir}/css/themes/*.css`,
		`${varDir}/css/scales/*.css`,
		`${varDir}/css/components/*.css`,
		`${varDir}/css/globals/*.css`,
		`${varDir}/custom.css`,
		// coreTokensFile, // @todo should we include the updated tokens?
	]);

	const usedVars = {};
	// Find all custom properties used in the component
	getVarsFromCSS(root).forEach((varName) => {
		if (
			(allVars[varName] || componentVars.includes(varName)) &&
			!varName.includes("spectrum-global") &&
			!varName.startsWith("--mod") &&
			!varName.startsWith("--highcontrast")
		) {
			usedVars[varName] = vars[varName];
		}
	});

	const contents = `
${classNames.map((className) => `${className}`).join(",\n")} {
${Object.entries(usedVars).map(([prop, value]) => `  ${prop}: ${value};`).join("\n")}
`;

    const outputPath = path.join(dirs.root, package, "dist/vars.css");

	return fsp.writeFile(outputPath, contents, { encoding: "utf-8" }).then(() => {
		if (fs.existsSync(outputPath)) {
			return [`${`✓`.green} ${path.join(outputPath).yellow} built`];
		}
		return [];
	});
}

function copyIndex(cwd) {
	if (!fs.existsSync(path.join(dirs.root, cwd, "dist/index-vars.css"))) return;

	// Copy index.vars as index.css to maintain backwards compat
	fs.copyFileSync(path.join(dirs.root, cwd, "dist/index-vars.css"), path.join(cwd, "dist/index.css"));

	return `${`✓`.green} ${"dist/index.css".yellow} copied ${`from ${"dist/index-vars.css"}`.grey}`;
}

const build = Promise.all(
	inputs.map(package => buildIndexVars(package).then(() =>
		Promise.all([
			buildVars(package),
			copyIndex(package),
		])
	))
);

exports.default = exports.build = build;
