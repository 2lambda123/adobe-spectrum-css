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

require("colors");

const { _: inputs = [] } = yargs(hideBin(process.argv)).argv;

/**
 *
 * @param {string[]} inputFiles
 * @param {string} output
 * @param {*} config
 * @returns
 */
async function builder(inputFiles, output, config = {}) {
	if (!inputFiles) return;

	const files = await fg(inputFiles, {
		cwd: config.cwd,
		allowEmpty: true,
		absolute: true,
	});

	if (!files || files.length === 0) return;

	const contents = files.reduce((content, file) => {
		const css = fs.readFileSync(file, "utf-8");
		if (!css || css.length === 0) return content;
		return `${content}\n/* Source: ${file} */\n\n${css}`;
	}, "");

	if (!contents || contents.length === 0) return;

	return postcssrc({ ...config, from: files[0] ?? undefined }, __dirname)
		.then(({ plugins, options }) =>
			postcss(plugins).process(contents, {
				from: files[0],
				...options,
			})
				.then((result) => {
					if (!result.css || result.css.length === 0) return;

					output = path.join(config.cwd, output);

					// Ensure the output directory exists and remove the file if it already exists
					if (!fs.existsSync(path.dirname(output))) {
						fs.mkdirSync(path.dirname(output), { recursive: true });
					} else if (fs.existsSync(output)) {
						fs.unlinkSync(output);

						// Remove the map file if it exists
						if (fs.existsSync(`${output}.map`)) {
							fs.unlinkSync(`${output}.map`);
						}
					}

					return Promise.all([
						fsp.writeFile(output, result.css, { encoding: "utf-8" }),
						result.map ? fsp.writeFile(`${output}.map`, result.map, { encoding: "utf-8" }) : Promise.resolve(),
					]).then(() => {
						const consoleOutput = [];
						if (fs.existsSync(output)) {
							consoleOutput.push(`${`✓`.green} ${output.yellow} built`);
						}
						if (fs.existsSync(`${output}.map`)) {
							consoleOutput.push(`${`✓`.green} ${`${output}.map`.yellow} built`);
						}
						return consoleOutput;
					});
				})
		);
}

async function buildCSS(package) {
	return builder([
		"index.css",
		"themes/spectrum.css", // spectrum comes first
		"themes/*.css",
	], "dist/index.css", { cwd: package });
}

async function buildCSSWithoutThemes(package) {
	return builder([
			"index.css",
			"themes/spectrum.css", // spectrum comes first
			"themes/express.css",
	], "dist/index-base.css", { cwd: package, splitinatorConfig: { noFlatVariables: true } });
}

async function buildCSSThemeIndex(package) {
	return builder([
			"themes/spectrum.css", // spectrum comes first
			"themes/express.css",
	], "dist/index-theme.css", { cwd: package, splitinatorConfig: { noSelectors: true } });
}

async function buildCSSThemes(package) {
	if (!fs.existsSync(path.join("themes"))) return;

	return Promise.all(
		fg.sync([
			"themes/*.css"
		], {
			ignore: ["themes/express.css"],
			allowEmpty: true,
		}).map((file) =>
			builder(file, `dist/${file}`, { cwd: package, splitinatorConfig: { noSelectors: true } })
		)
	);
}

/**
  Special case for express: it needs Spectrum base vars and needs to override them
*/
async function buildExpressTheme(package) {
	return builder([
		"dist/index-theme.css",
	], "dist/themes/express.css", {
		cwd: package,
		additionalPlugins: [
			require("postcss-combininator"),
		],
	});
}

function copyIndex(cwd) {
	if (!fs.existsSync(path.join(cwd, "dist/index.css"))) return;

	// Copy index.vars as index.css to maintain backwards compat
	fs.copyFileSync(path.join(cwd, "dist/index.css"), path.join(cwd, "dist/index-vars.css"));

	return `${`✓`.green} ${"dist/index-vars.css".yellow} copied ${`from ${"dist/index.css"}`.grey}`;
}

const build = Promise.all(
	inputs.map(package => Promise.all([
		buildCSS(package).then(() => copyIndex(package)),
		buildCSSWithoutThemes(package),
		buildCSSThemes(package).then(() => buildCSSThemeIndex(package).then(() => buildExpressTheme(package))),
	]))
);

exports.default = exports.build = build;
