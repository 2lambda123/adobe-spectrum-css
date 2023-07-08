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

const gulp = require("gulp");
const concat = require("gulp-concat");
const rename = require("gulp-rename");

const dirs = require("./lib/dirs");

const docs = require("./docs");
const dev = require("./dev");
const subrunner = require("./subrunner");
const vars = require("./vars");

const depSolver = require("dependency-solver");

var dependencyOrder = null;

// Combined
function concatPackageFiles(taskName, input, output, directory) {
	return class {
		constructor() {
			this.name = taskName;

			let glob;
			if (Array.isArray(input)) {
				glob = [];

				dependencyOrder.forEach(function (dep) {
					input.forEach(function (file) {
						glob.push(dirs.resolve(dep) + `/${file}`);
					});
				});
			} else {
				glob = dependencyOrder.map(function (dep) {
					return dirs.resolve(dep) + `/${input}`;
				});
			}

			return gulp
				.src(glob, { allowEmpty: true })
				.pipe(concat(output))
				.pipe(gulp.dest(`dist/${directory || ""}`));
		}
	};
}

/**
 * Given a package path, get its dependencies
 * @param {string} packages - package directory
 * @return {Object} An object mapping the package name to its dependencies, or null if no dependencies
 */
async function getDependencies(pkg) {
	let dependencies = [];

	if (pkg.devDependencies) {
		dependencies = Object.keys(pkg.devDependencies).filter((dep) => {
			return (
				dep.indexOf("@spectrum-css") === 0 &&
				dep !== "@spectrum-css/bundle-builder" &&
				dep !== "@spectrum-css/component-builder" &&
				dep !== "@spectrum-css/component-builder-simple"
			);
		});
	}

	return { name: pkg.name, dependencies: dependencies };
}

/**
 * Get the list of all packages in given directory
 * @param {string} packagesDir - directory of packages
 * @return {Object} An array of package names in dependency order
 */
async function getFolderDependencyOrder(packagesDir) {
	async function getDependenciesForSolver(package) {
		const { name, dependencies } = await getDependencies(package);
		if (dependencies.length === 0) return null;
		return { [name]: dependencies };
	}

	// Get list of all packages
	const packagePaths = (await fsp.readdir(packagesDir, { withFileTypes: true }))
		.filter((dirent) => dirent.isDirectory() || dirent.isSymbolicLink())
		.map((dirent) => path.join(packagesDir, dirent.name));

	const dependencies = await Promise.all(
		packagePaths.map((pkgPath) => {
			const pkg = require(path.join(pkgPath, "/package.json")) ?? {};
			return getDependenciesForSolver(pkg);
		})
	)
		.then((deps) => {
			return deps.reduce((acc, dep) => ({ ...acc, ...dep }), {});
		})
		.catch((err) => {
			console.error(err);
		});

	const solution = depSolver.solve(dependencies);

	// Nobody relies on it, so it gets clipped out of the solution
	solution.push("@spectrum-css/expressvars");

	// Build tokens first
	// This is because not every package relies on tokens, but the builder needs tokens to bake vars
	solution = solution.filter((p) => p !== "@spectrum-css/tokens");
	solution.unshift("@spectrum-css/tokens");

	return solution;
}

let buildCombined = gulp.series(
	async () => getFolderDependencyOrder(dirs.components),
	gulp.parallel(
		concatPackageFiles("buildCombined_core", "index.css", "spectrum-core.css"),
		concatPackageFiles(
			"buildCombined_large",
			"index-lg.css",
			"spectrum-core-lg.css"
		),
		concatPackageFiles(
			"buildCombined_diff",
			"index-diff.css",
			"spectrum-core-diff.css"
		),
		concatPackageFiles(
			"buildCombined_light",
			"multiStops/light.css",
			"spectrum-light.css"
		),
		concatPackageFiles(
			"buildCombined_lightest",
			"multiStops/lightest.css",
			"spectrum-lightest.css"
		),
		concatPackageFiles(
			"buildCombined_dark",
			"multiStops/dark.css",
			"spectrum-dark.css"
		),
		concatPackageFiles(
			"buildCombined_darkest",
			"multiStops/darkest.css",
			"spectrum-darkest.css"
		)
	)
);

let buildStandalone = gulp.series(
	async () => getFolderDependencyOrder(dirs.components),
	gulp.parallel(
		concatPackageFiles(
			"buildStandalone_light",
			["index.css", "colorStops/light.css"],
			"spectrum-light.css",
			"standalone/"
		),
		concatPackageFiles(
			"buildStandalone_lightest",
			["index.css", "colorStops/lightest.css"],
			"spectrum-lightest.css",
			"standalone/"
		),
		concatPackageFiles(
			"buildStandalone_dark",
			["index.css", "colorStops/dark.css"],
			"spectrum-dark.css",
			"standalone/"
		),
		concatPackageFiles(
			"buildStandalone_darkest",
			["index.css", "colorStops/darkest.css"],
			"spectrum-darkest.css",
			"standalone/"
		),
		concatPackageFiles(
			"buildStandalone_lightLarge",
			["index-lg.css", "colorStops/light.css"],
			"spectrum-light-lg.css",
			"standalone/"
		),
		concatPackageFiles(
			"buildStandalone_lightestLarge",
			["index-lg.css", "colorStops/lightest.css"],
			"spectrum-lightest-lg.css",
			"standalone/"
		),
		concatPackageFiles(
			"buildStandalone_darkLarge",
			["index-lg.css", "colorStops/dark.css"],
			"spectrum-dark-lg.css",
			"standalone/"
		),
		concatPackageFiles(
			"buildStandalone_darkestLarge",
			["index-lg.css", "colorStops/darkest.css"],
			"spectrum-darkest-lg.css",
			"standalone/"
		)
	)
);

// run buildLite on a selected set of packages that depend on commons
// yay: faster than 'rebuild everything' approach
// boo: must add new packages here as commons grows
function buildDepenenciesOfCommons() {
	const dependentComponents = [
		`${dirs.components}/actionbutton`,
		`${dirs.components}/button`,
		`${dirs.components}/clearbutton`,
		`${dirs.components}/closebutton`,
		`${dirs.components}/infieldbutton`,
		`${dirs.components}/logicbutton`,
		`${dirs.components}/picker`,
		`${dirs.components}/pickerbutton`,
	];
	return subrunner.runTaskOnPackages("buildLite", dependentComponents);
}

function copyPackages() {
	return gulp
		.src([
			`${dirs.components}/*/package.json`,
			`${dirs.components}/*/dist/**`,
			`!${dirs.components}/*/dist/docs/**`,
		])
		.pipe(
			rename(function (file) {
				file.dirname = file.dirname.replace("/dist", "");
			})
		)
		.pipe(gulp.dest("dist/components/"));
}

const buildDocs = gulp.parallel(docs.build, copyPackages);

function buildIfTopLevel() {
	let builtTasks = gulp.parallel(buildCombined, buildStandalone, buildDocs);

	if (process.cwd() === dirs.topLevel) {
		// Run a build for all packages first
		return gulp.series(subrunner.buildComponents, builtTasks);
	}

	// They're already built, just include the output
	return builtTasks;
}

let build = gulp.series(buildIfTopLevel(), vars.copyVars);

let buildLite = gulp.series(function buildComponentsLite() {
	return subrunner.runTaskOnAllComponents("buildLite");
}, buildDocs);

let buildMedium = gulp.series(function buildComponentsLite() {
	return subrunner.runTaskOnAllComponents("buildMedium");
}, buildDocs);

let buildHeavy = gulp.series(function buildComponentsLite() {
	return subrunner.runTaskOnAllComponents("buildHeavy");
}, buildDocs);

let devTask;
if (process.cwd() === dirs.topLevel) {
	// Build all packages if at the top level
	devTask = gulp.series(buildLite, dev.watch);
} else {
	// Otherwise, just start watching
	devTask = gulp.series(buildDocs, dev.watch);
}

exports.devHeavy = gulp.series(buildHeavy, dev.watch);

exports.copyVars = vars.copyVars;

exports.buildUniqueVars = vars.buildUnique;

exports.buildComponents = subrunner.buildComponents;
exports.buildCombined = buildCombined;
exports.buildStandalone = buildStandalone;
exports.buildLite = buildLite;
exports.buildDocs = buildDocs;
exports.buildDepenenciesOfCommons = buildDepenenciesOfCommons;
exports.copyPackages = copyPackages;
exports.dev = devTask;
exports.build = build;
exports.watch = dev.watch;
exports.default = buildMedium;
