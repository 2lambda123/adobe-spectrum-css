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
const { rimraf } = require("rimraf");

const {
	getAllComponentVars,
	getAllVars,
	getVarsDefinedInCSS,
	getVarsFromCSS,
	getClassNames,
	getVariableDeclarations,
} = require("./utilities");

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
	const files = await fg(["index.css", "skin.css"], {
		allowEmpty: true, // Allow missing skin.css
	});

	if (!files || !files.length) return;

	// Clean the destination directory before building
	exports.clean();

	const content = files
		.map((file) => {
			return fs.readFileSync(file, "utf8");
		})
		.join("\n");

	await processAndWrite(content, "index.css", "dist/index-vars.css")
		.then(() => {
			// Just copy index.css as index.css to maintain backwards compat
			fs.copyFileSync("dist/index-vars.css", "dist/index.css");
		})
		.catch((error) => {
			console.error(error);
		});

	// Get vars defined inside of the component
	const componentVars = getVarsDefinedInCSS(content);

	// Get vars in ALL components
	const vars = await getAllComponentVars();

	// Get literally all of the possible vars (even overridden vars that are different between themes/scales)
	const allVars = await getAllVars();

	// For each color stop and scale, filter the variables for those matching the component
	const usedVars = {};
	// Find all custom properties used in the component
	getVarsFromCSS(content)?.forEach((varName) => {
		if (varName.indexOf("spectrum-global") !== -1) {
			console.warn(`⚠️  ${pkg.name} directly uses global variable ${varName}`);
		} else if (
			!allVars[varName] &&
			!varName.startsWith("--mod") &&
			!varName.startsWith("--highcontrast")
		) {
			if (componentVars.indexOf(varName) === -1) {
				console.error(`⛔️ ${pkg.name} uses undefined variable ${varName}`);
			} else {
				console.warn(`🔶 ${pkg.name} uses locally defined variable ${varName}`);
			}
		} else {
			usedVars[varName] = vars[varName];
		}
	});

	const pkg = await fsp
		.readFile(path.join("package.json"))
		.then(JSON.parse)
		.catch(() => ({}));

	const classNames = getClassNames(content, pkg.name.split("/").pop());
	const result = getVariableDeclarations(classNames, usedVars);
	await fsp.writeFile("dist/vars.css", result);
};
