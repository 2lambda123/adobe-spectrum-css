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

require("colors");

/**
 * @typedef {Object} PostCSSOptions
 * @property {string} [cwd=] - the current working directory
 * @property {boolean} [verbose=false] - whether to log verbose output
 */

/**
 * @description Build a CSS file from a list of input files
 * @param {string|string[]} inputFiles
 * @param {string} output
 * @param {PostCSSOptions} [config={}]
 * @returns {Promise<string[]>} - list of files written
 */
async function builder(inputFiles, output, config = {}) {
	if (!inputFiles || inputFiles.length === 0) return;

	let { cwd = process.cwd(), verbose = false } = config;

	const files = await fg(inputFiles, {
		cwd,
		allowEmpty: true,
		absolute: true,
	});

	if (!files || files.length === 0) return;

	const contents = files.reduce((content, file) => {
		const css = fs.readFileSync(file, "utf-8");
		if (!css || css.length === 0) return content;
		return `${content}\n/** Source: ${file} */\n\n${css}`;
	}, "");

	if (!contents || contents.length === 0) return;

	return postcssrc({ ...config, from: files[0] }, __dirname)
		.then(({ plugins, options }) =>
			postcss(plugins).process(contents, options)
				.then((result) => {
					if (!result.css || result.css.length === 0) return;

					output = path.join(cwd, output);
					if (!fs.existsSync(path.dirname(output))) {
						fs.mkdirSync(path.dirname(output), { recursive: true });
					}

					return Promise.all([
						fsp.writeFile(output, result.css, { encoding: "utf-8" }),
						result.map ? fsp.writeFile(`${output}.map`, result.map, { encoding: "utf-8" }) : Promise.resolve(),
					]).then(() => {
						const files = [];
						if (verbose && fs.existsSync(output)) {
							console.log(`${`✓`.green} ${path.relative(cwd, output).yellow} built`);
							files.push(output);
						}
						if (verbose && fs.existsSync(`${output}.map`)) {
							console.log(`${`✓`.green} ${`${path.relative(cwd, output)}.map`.yellow} built`);
							files.push(`${output}.map`);
						}
						return files;
					});
				})
		);
}

/**
 * Copies dist/index-vars.css to dist/index.css
 * @param {import('fs').PathLike} folder - folder to build
 * @returns {Promise<void>}
 */
async function copyIndex(from, to, { cwd = process.cwd() } = {}) {
	// Skip if dist/index-vars.css doesn't exist
	if (!fs.existsSync(path.join(cwd, from))) return;

	if (!fs.existsSync(path.dirname(path.join(cwd, to)))) {
		fs.mkdirSync(path.dirname(path.join(cwd, to)), { recursive: true });
	}

	// Copy index.vars as index.css to maintain backwards compat
	return fsp.copyFile(path.join(cwd, from), path.join(cwd, to));
}

/**
 * @description Build a set of stylesheets from the source CSS in a package
 * @param {string} [folder]
 * @param {Object} [options={}]
 * @param {boolean} [options.verbose=true]
 * @returns
 */
async function build(folder = undefined, {
	verbose = process.env.VERBOSE ?? process.env.NX_VERBOSE_LOGGING ?? !process.env.QUIET ?? true
} = {}) {
	if (!folder) folder = process.cwd();

	// Skip if no package.json
	if (!fs.existsSync(path.join(folder, "package.json"))) return;

	const { name } = require(path.join(folder, "package.json"));

	if (verbose) console.log(`[component-builder] 🔨 ${name.cyan}`);

	return Promise.all([
		builder(["index.css", "skin.css"], "dist/index-vars.css", {
			cwd: folder,
			verbose,
		}).then(() => copyIndex("dist/index-vars.css", "dist/index.css", { cwd: folder })),
		builder(["index.css", "skin.css"], "dist/vars.css", {
			cwd: folder,
			verbose: verbose && name && !["site", "page"].includes(name.split("/").pop()),
			varsOnly: true,
		}),
	]);
}

module.exports = build;
