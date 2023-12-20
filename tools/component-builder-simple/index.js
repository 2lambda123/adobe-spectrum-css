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

const rootDir = path.join(__dirname, "../../");

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

async function buildIndex(folder, { verbose = false } = {}) {
	return builder([
		"index.css",
		"themes/spectrum.css", // spectrum comes first
		"themes/*.css",
	], "dist/index.css", { cwd: folder, verbose });
}

async function buildCSSWithoutThemes(folder, { verbose = false } = {}) {
	return builder([
			"index.css",
			"themes/spectrum.css", // spectrum comes first
			"themes/*.css",
	], "dist/index-base.css", { cwd: folder, verbose, splitinatorOptions: { noFlatVariables: true } });
}

async function buildCSSThemeIndex(folder, { verbose = false } = {}) {
	return builder([
			"themes/spectrum.css", // spectrum comes first
			"themes/*.css",
	], "dist/index-theme.css", { cwd: folder, verbose, splitinatorOptions: { noSelectors: true } });
}

async function buildCSSThemes(folder, { verbose = false } = {}) {
	if (!fs.existsSync(path.join(folder, "themes"))) return;

	return Promise.all(
		fg.sync([
			"themes/*.css"
		], {
			ignore: ["themes/express.css"],
			cwd: folder,
			allowEmpty: true,
		}).map((file) =>
			builder(file, `dist/${file}`, { cwd: folder, verbose, splitinatorOptions: { noSelectors: true } })
		)
	);
}

/**
  Special case for express: it needs Spectrum base vars and needs to override them
*/
async function buildExpressTheme(folder, { verbose = false } = {}) {
	return builder([
		"dist/index-theme.css",
	], "dist/themes/express.css", {
		cwd: folder,
		verbose,
		additionalPlugins: [
			require("postcss-combininator"),
		],
	});
}

function copyIndex(sourceFile, destFile, { cwd = process.cwd(), verbose = false } = {}) {
	if (!fs.existsSync(path.join(cwd, sourceFile))) return;

	// Copy index.vars as index.css to maintain backwards compat
	fs.copyFileSync(path.join(cwd, sourceFile), path.join(cwd, destFile));

	if (verbose) console.log(`${`✓`.green} ${destFile.yellow} copied ${`from ${sourceFile}`.grey}`);
}

async function build(folder, {
	verbose = process.env.VERBOSE ?? process.env.NX_VERBOSE_LOGGING ?? !process.env.QUIET ?? true
} = {}) {
	if (verbose) console.log(`[component-builder-simple] 🔨 ${path.relative(rootDir, folder).cyan}`);
	return Promise.all([
		buildIndex(folder, { verbose }).then(() =>
			copyIndex("dist/index.css", "dist/index-vars.css", { cwd: folder, verbose })
		),
		buildCSSWithoutThemes(folder, { verbose }),
		buildCSSThemes(folder, { verbose }),
		buildCSSThemeIndex(folder, { verbose }).then(() =>
			buildExpressTheme(folder, { verbose })
		),
	]);
}

module.exports = build;
