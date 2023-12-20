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
const pug = require("pug");
const yaml = require("js-yaml");

const rootPath = path.join(__dirname, "../../../");
const sitePath = path.join(rootPath, "site");

const util = require(`${sitePath}/util`);

function getDependencies({
	dependencies = {},
	devDependencies = {},
	peerDependencies = {},
}) {
	const deps = new Set();

	for (const dep of [
		...Object.keys(dependencies),
		...Object.keys(devDependencies),
		...Object.keys(peerDependencies),
	]) {
		if (!dep.startsWith("@spectrum-css")) continue;
		if (dep === "@spectrum-css/bundle-builder") continue;
		if (dep === "@spectrum-css/component-builder") continue;
		if (dep === "@spectrum-css/component-builder-simple") continue;
		deps.add(dep.split("/").pop());
	}

	return [...deps].sort();
}

async function buildDocs() {
	const cwd = process.cwd();

	const template = path.join(sitePath, "templates/individualComponent.pug");
	if (!fs.existsSync(template)) {
		return reject(new Error("Unable to compile docs, missing template"));
	}

	const packagePath = path.join(cwd, "package.json");
	if (!fs.existsSync(packagePath)) {
		return reject(new Error("Unable to compile docs, missing package.json"));
	}

	const pkg = require(packagePath) ?? {};
	const dependencies = getDependencies(pkg);

	const dnaVars = require("@spectrum-css/vars");

	const files = fg.sync("metadata/*.yml", {
		cwd,
		allowEmpty: true,
		absolute: true,
	});

	const promises = [];
	for (const file of files) {
		const componentPath = path.relative(rootPath, path.dirname(file))?.replace("/metadata", "");
		const outputPath = path.join(rootPath, "dist", componentPath, `${path.basename(file, ".yml")}.html`);
		const contents = fs.readFileSync(file, "utf-8");
		const compiled = pug.renderFile(template, {
			component: yaml.load(contents),
			dependencies,
			dnaVars,
			pkg,
			util,
		});

		if (!fs.existsSync(path.dirname(outputPath))) {
			await fsp.mkdir(path.dirname(outputPath), { recursive: true });
		}

		promises.push(
			fsp.writeFile(outputPath, compiled)
		);
	}

	return Promise.all(promises);
}

exports.buildDocs = buildDocs;
