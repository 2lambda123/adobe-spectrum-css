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

const fg = require("fast-glob");
const postcss = require("postcss");
const { rimraf } = require("rimraf");

const processorsFunction = require("./processors").getProcessors;

const processAndWrite = (content, from, to, plugins = processorsFunction()) =>
	postcss(plugins)
		.process(content, { from, to })
		.then((result) => {
			if (!result?.css) return;
			return fsp.writeFile(to, result.css);
		})
		.catch((error) => {
			console.error(error);
		});

exports.clean = async () =>
	rimraf("dist/*", {
		preserveRoot: false,
		glob: true,
	});

exports.default = exports.build = async function () {
	const files = await fg(
		[
			"index.css",
			"themes/spectrum.css", // spectrum comes first
			"themes/*.css",
		],
		{
			allowEmpty: true,
		}
	);

	if (!files || !files.length) return;

	// Clean the destination directory before building
	exports.clean();

	const allContent = files.map((file) => {
		const input = fs.readFileSync(file, "utf8");
		if (file.match(/\/themes\/.*\.css$/)) {
			return processAndWrite(
				input,
				file,
				file.replace("themes/", "dist/themes/"),
				processorsFunction({ noSelectors: true })
			);
		}
		return input;
	});

	if (!content || !content.length) return;

	const content = allContent.join("\n");
	const themes = allContent.slice(1)?.join("\n");

	return Promise.all([
		processAndWrite(content, "./index.css", "./dist/index.css")
			.then(() => {
				// Just copy index.css as index.css to maintain backwards compat
				fs.copyFileSync("dist/index.css", "dist/index-vars.css");
			})
			.catch((error) => {
				console.error(error);
			}),
		processAndWrite(
			content,
			"./index.css",
			"./dist/index-base.css",
			processorsFunction({ noFlatVariables: true })
		),
		processAndWrite(
			themes,
			"./themes/spectrum.css",
			"./dist/index-theme.css",
			processorsFunction({ noSelectors: true })
		),
		processAndWrite(themes, "dist/index-theme.css", "dist/themes/express.css", [
			...processorsFunction(),
			require("postcss-combininator"),
		]),
	]);
};
