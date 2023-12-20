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

async function builder(inputFiles, output, config = {}) {
	const cwd = process.cwd();

	const files = await fg(inputFiles, {
		cwd,
		allowEmpty: true,
		absolute: true,
	});

	if (files.length === 0) return;

	let content = "";
	for (const file of files) {
		const css = await fsp.readFile(file, "utf-8");
		content += css;
	}

	if (!content || content.length === 0) return;

	return postcssrc({ ...config, from: inputFiles[0] })
		.then(({ plugins, options }) =>
			postcss(plugins).process(content, options)
				.then((result) => {
					if (!result.css || result.css.length === 0) return;

					if (!fs.existsSync(path.dirname(output))) {
						fs.mkdirSync(path.dirname(output), { recursive: true });
					}

					return Promise.all([
						fsp.writeFile(output, result.css, { encoding: "utf-8" }),
						result.map ? fsp.writeFile(`${output}.map`, result.map, { encoding: "utf-8" }) : Promise.resolve(),
					]);
				})
		);
}

async function buildIndex() {
	return builder([
		"index.css",
		"themes/spectrum.css", // spectrum comes first
		"themes/*.css",
	], path.join(process.cwd(), "dist/index.css"));
}

async function buildCSSWithoutThemes() {
	return builder([
			"index.css",
			"themes/spectrum.css", // spectrum comes first
			"themes/*.css",
	], path.join(process.cwd(), "dist/index-base.css"), { splitinatorOptions: { noThemes: true } });
}

async function buildCSSThemeIndex() {
	return builder([
			"themes/spectrum.css", // spectrum comes first
			"themes/*.css",
	], path.join(process.cwd(), "dist/index-theme.css"), { splitinatorOptions: { noSelectors: true } });
}

async function buildCSSThemes() {
	const cwd = process.cwd();

	return Promise.all(
		fg.sync([
			"themes/*.css"
		], {
			cwd,
			absolute: true,
			allowEmpty: true,
		}).map((file) =>
			builder(file, path.join(process.cwd(), `dist/themes/${path.basename(file)}`), { splitinatorOptions: { noSelectors: true } })
		)
	);
}

/**
  Special case for express: it needs Spectrum base vars and needs to override them
*/
async function buildExpressTheme() {
	return builder([
		"dist/index-theme.css",
	], path.join(process.cwd(), 'dist/themes/express.css'), {
		additionalPlugins: [require("postcss-combininator")],
	});
}

function buildCSS() {
	return Promise.all([
		buildIndex(),
		buildCSSWithoutThemes(),
		buildCSSThemes(),
		buildCSSThemeIndex().then(buildExpressTheme),
	]);
}

exports.buildCSS = buildCSS;
