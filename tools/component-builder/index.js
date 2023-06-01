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

const fsp = require("fs").promises;
const path = require("path");

const gulp = require("gulp");
const postcss = require("gulp-postcss");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const through = require("through2");
const logger = require("gulplog");

const postcss = require("postcss");

const processors = require("./processors").processors;

const varDir = path.join(
	path.dirname(
		require.resolve("@spectrum-css/vars", {
			paths: [process.cwd(), path.join(process.cwd(), "../../")],
		})
	),
	".."
);
const coreTokensFile = require.resolve("@spectrum-css/tokens", {
	paths: [process.cwd(), path.join(process.cwd(), "../../")],
});

exports.getVarsFromCSS = (css) => {
	const variableList = [];

	postcss.parse(css).walkRules((rule) => {
		rule.walkDecls((decl) => {
			let matches = decl.value.match(/var\(.*?\)/g);
			if (matches) {
				matches.forEach(function (match) {
					let varName = match.replace(/var\((--[\w\-]+),?.*?\)/, "$1").trim();
					if (variableList.indexOf(varName) === -1) {
						variableList.push(varName);
					}
				});
			}
		});
	});

	return variableList;
};

exports.getVarsDefinedInCSS = (css) => {
	const variableList = [];

	postcss.parse(css).walkRules((rule) => {
		rule.walkDecls((decl) => {
			if (decl.prop.startsWith("--")) {
				let varName = decl.prop;
				if (variableList.indexOf(varName) === -1) {
					variableList.push(varName);
				}
			}
		});
	});

	return variableList;
};

exports.getVarValues = (css) => {
	const variables = {};

	postcss.parse(css).walkRules((rule) => {
		rule.walkDecls((decl) => {
			variables[decl.prop] = decl.value;
		});
	});

	return variables;
};

exports.getClassNames = (contents, pkgName) => {
	const classNames = new Set();

	postcss.parse(contents).walkRules((rule) => {
		if (pkgName === "page") return;

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
};

exports.resolveValue = (value) => {
	if (!value) return;

	const match = value.match(/var\((.+),?.*?\)/);
	if (!match) return value;
	return match[1];
};

exports.readDNAVariables = async (file) => {
	const css = await fsp.readFile(path.join(varDir, "css", file));
	return exports.getVarValues(css);
};

exports.getVariableDeclarations = (classNames, vars) => {
	const varNames = Object.keys(vars);
	if (!varNames || varNames.length === 0) return "";

	return `
${classNames.map((className) => `${className}`).join(",\n")} {
${varNames.map((varName) => `  ${varName}: ${vars[varName]};`).join("\n")}
}
`;
};

exports.getAllVars = () =>
	new Promise((resolve, reject) => {
		let variableList;

		gulp
			.src([
				`${varDir}/css/themes/*.css`,
				`${varDir}/css/scales/*.css`,
				`${varDir}/css/components/*.css`,
				`${varDir}/css/globals/*.css`,
				`${varDir}/custom.css`,
				coreTokensFile,
			])
			.pipe(concat("everything.css"))
			.pipe(
				through.obj((file, _enc, cb) => {
					variableList = exports.getVarValues(file.contents.toString());

					cb(null, file);
				})
			)
			.on("finish", () => {
				resolve(variableList);
			})
			.on("error", reject);
	});

exports.getAllComponentVars = () =>
	new Promise((resolve, reject) => {
		let variableList;

		gulp
			.src([
				`${varDir}/css/components/*.css`,
				`${varDir}/css/globals/*.css`,
				`${varDir}/custom.css`,
			])
			.pipe(concat("everything.css"))
			.pipe(
				through.obj(function getAllVars(file, _enc, cb) {
					variableList = exports.getVarValues(file.contents.toString());

					cb(null, file);
				})
			)
			.on("finish", () => {
				resolve(variableList);
			})
			.on("error", reject);
	});

// Read in all variables used
// Read in all vars from recent DNA
// Include definitions if they refer to a variable, static if not
exports.buildIndexVars = () => {
	return gulp
		.src(["index.css", "skin.css"], {
			allowEmpty: true, // Allow missing skin.css
		})
		.pipe(concat("index-vars.css"))
		.pipe(postcss(processors))
		.pipe(gulp.dest("dist/"));
};

exports.default =
	exports.build =
	exports.buildVars =
		gulp.series(exports.buildIndexVars, function bakeVars() {
			return gulp
				.src(["dist/index-vars.css"], {
					allowEmpty: true,
				})
				.pipe(
					through.obj(async function doBake(file, enc, cb) {
						const pkg = await fsp
							.readFile(path.join("package.json"))
							.then(JSON.parse);
						const pkgName = pkg.name.split("/").pop();
						const classNames = exports.getClassNames(file.contents, pkgName);

						// Find all custom properties used in the component
						const variableList = exports.getVarsFromCSS(file.contents);

						// Get vars defined inside of the component
						const componentVars = exports.getVarsDefinedInCSS(file.contents);

						// Get vars in ALL components
						const vars = await exports.getAllComponentVars();

						// Get literally all of the possible vars (even overridden vars that are different between themes/scales)
						const allVars = await exports.getAllVars();

						// For each color stop and scale, filter the variables for those matching the component
						const errors = [];
						const usedVars = {};
						variableList.forEach((varName) => {
							if (varName.indexOf("spectrum-global") !== -1) {
								logger.warn(
									`⚠️  ${pkg.name} directly uses global variable ${varName}`
								);
							} else if (
								!allVars[varName] &&
								!varName.startsWith("--mod") &&
								!varName.startsWith("--highcontrast")
							) {
								if (componentVars.indexOf(varName) === -1) {
									errors.push(`${pkg.name} uses undefined variable ${varName}`);
								} else {
									logger.warn(
										`🔶 ${pkg.name} uses locally defined variable ${varName}`
									);
								}
							} else {
								usedVars[varName] = vars[varName];
							}
						});

						if (errors.length) {
							return cb(new Error(errors.join("\n")), file);
						}

						let contents = exports.getVariableDeclarations(
							classNames,
							usedVars
						);
						let newFile = file.clone({ contents: false });
						newFile.path = path.join(file.base, `vars.css`);
						newFile.contents = Buffer.from(contents);

						cb(null, newFile);
					})
				)
				.pipe(gulp.dest("dist/"));
		});

exports.buildCSS = gulp.series(exports.buildVars, function copyIndex() {
	// Just copy index.vars as index.css to maintain backwards compat
	return gulp
		.src("dist/index-vars.css")
		.pipe(
			rename((file) => {
				file.basename = "index";
			})
		)
		.pipe(gulp.dest("dist/"));
});
