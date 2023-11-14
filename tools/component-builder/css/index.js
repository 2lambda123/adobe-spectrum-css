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

const path = require("path");

const gulp = require("gulp");
const postcss = require("gulp-postcss");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const through = require("through2");

const varUtils = require("./lib/varUtils");
const processors = require("./processors").processors;

// Read in all variables used
// Read in all vars from recent DNA
// Include definitions if they refer to a variable, static if not
function buildIndexVars() {
	return gulp
		.src(["index.css", "skin.css"], {
			allowEmpty: true, // Allow missing skin.css
		})
		.pipe(concat("index-vars.css"))
		.pipe(postcss(processors))
		.pipe(gulp.dest("dist/"));
}

function bakeVars() {
	return gulp
		.src(["dist/index-vars.css"], {
			allowEmpty: true,
		})
		.pipe(
			through.obj(async function doBake(file, _, cb) {
				const pkg = require(path.join(process.cwd(), "package.json"));
				const pkgName = pkg.name.split("/").pop();
				const classNames = varUtils.getClassNames(file.contents, pkgName);

				// Get vars in ALL components
				const vars = await varUtils.getAllComponentVars();

				// Get literally all of the possible vars (even overridden vars that are different between themes/scales)
				const allVars = await varUtils.getAllVars();

				const usedVars = {};

				varUtils.getVarsFromCSS(file.contents)?.filter(varName => (
					!varName.includes("spectrum-global") && (
					allVars[varName] ||
					varName.startsWith("--mod") &&
					varName.startsWith("--highcontrast")
				)))?.forEach((varName) => usedVars[varName] = vars[varName]);

				let contents = varUtils.getVariableDeclarations(classNames, usedVars);
				let newFile = file.clone({ contents: false });

				newFile.path = path.join(file.base, `vars.css`);
				newFile.contents = Buffer.from(contents);

				cb(null, newFile);
			})
		)
		.pipe(gulp.dest("dist/"));
}

let buildVars = gulp.series(buildIndexVars, bakeVars);

exports.buildIndexVars = buildIndexVars;
exports.buildVars = buildVars;

exports.buildCSS = gulp.series(buildVars, function copyIndex() {
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
