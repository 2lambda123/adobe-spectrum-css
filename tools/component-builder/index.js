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

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { buildCSS, buildVars, buildIndexVars } = require("./css");
const { buildDocs } = require("./docs");

async function build() {
	return Promise.all([
		buildVars(),
		buildDocs(),
	]);
}

async function main(inputs = []) {
	const cwd = process.cwd();

	await Promise.all(
		inputs.map(async (folder) => {
			process.chdir(folder);
			return build();
		}),
	).catch((err) => {
		console.error(err);
		process.exit(1);
	});

	process.chdir(cwd);
	return Promise.resolve();
}

const { _ = [] } = yargs(hideBin(process.argv)).argv;
main(_).catch((err) => {
	console.error(err);
	process.exit(1);
});

exports.build = build;
exports.buildLite = buildIndexVars;
exports.buildMedium = buildVars;
exports.buildHeavy = buildCSS;

exports.buildCSS = buildCSS;
exports.buildVars = buildVars;

exports.buildDocs = buildDocs;
exports.buildDocs_html = buildDocs;
