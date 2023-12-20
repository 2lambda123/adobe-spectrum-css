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
const path = require("path");

const browserSync = require("browser-sync");
const chokidar = require('chokidar');

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const builder = require("./builder.js");

require("colors");

const rootPath = path.join(__dirname, "../..");
const sitePath = path.join(__dirname, "..");
const componentPath = path.join(rootPath, "components");
const destPath = path.join(sitePath, "dist");

async function buildDependenciesOfCommons() {
	const dependOnCommons = ["actionbutton", "button", "closebutton", "popover"];
	return Promise.all(
		dependOnCommons.map(dep => {
			const packageDir = path.join(componentPath, dep);
			return runComponentTask(packageDir);
		})
	);
}

/* Run the specified task for the given package */
function runComponentTask(packageDir) {
	const taskFile = path.join(packageDir, "index.js");

	if (!fs.existsSync(taskFile)) return;

	const componentBuilder = require(taskFile);
	if (!componentBuilder) return;

	const packageName = packageDir.split("/").pop();
	const pathToPackage = path.dirname(
		require.resolve(`@spectrum-css/${packageName}/package.json`, {
			paths: [process.cwd(), path.join(process.cwd(), "../../")],
		})
	);
	const relativePath = path.relative(rootPath, pathToPackage);

	return componentBuilder(relativePath, { verbose: false }).then(() => {
		console.log(`${`✓`.green} ${`@spectrum-css/${packageName}`.cyan}`);
		return builder.copyPackageAssets(packageDir);
	}).catch((err) => {
		if (err) {
			Promise.reject(new Error(`🔴 Error running ${packageName.cyan}: ${err}`));
		}
	});
}

async function watcher(paths, changeTasks, cleanTasks = undefined) {
	if (!cleanTasks) cleanTasks = changeTasks;
	return chokidar.watch(paths, {
		ignoreInitial: true,
	})
		.on('add', async (newPath) => {
			console.log(`File ${path.relative(rootPath, newPath).yellow} has been added.`);
			if (typeof changeTasks === "function") {
				await changeTasks(changedPath);
			}
			return browserSync.reload();
		})
		.on('change', async (changedPath) => {
			console.log(`File ${path.relative(rootPath, changedPath).yellow} changed.`);
			if (typeof changeTasks === "function") {
				await changeTasks(changedPath);
			}
			return browserSync.reload();
		})
		.on('unlink', async (removedPath) => {
			log(`File ${path.relative(rootPath, removedPath).yellow} has been removed.`);
			if (typeof cleanTasks === "function") {
				await cleanTasks(changedPath);
			}
			return browserSync.reload();
		});
}

function watch() {
	browserSync({
		startPath: "index.html",
		server: destPath,
		notify: process.env.BROWSERSYNC_NOTIFY === "true" ? true : false,
		open: process.env.BROWSERSYNC_OPEN !== "true" ? false : true,
		port: process.env.BROWSERSYNC_PORT ?? 3000,
	});

	watcher(
		[`${componentPath}/commons/*.css`],
		buildDependenciesOfCommons(),
	);

	const packages = fs.readdirSync(componentPath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory() || dirent.isSymbolicLink())
		.map((dirent) => path.join(componentPath, dirent.name));

	packages.forEach((packageDir) =>
		watcher(
			[
				`${packageDir}/*.css`,
				`${packageDir}/themes/*.css`,
			],
			runComponentTask(packageDir),
		)
	);

	watcher([`${componentPath}/*/metadata/*.yml`], (changedPath) => {
		const foldername = path.relative(componentPath, path.dirname(changedPath)).split(path.sep).shift();
		return builder.buildPackage(`@spectrum-css/${foldername}`);
	});

	watcher([`${sitePath}/*.pug`], builder.buildPage);

	/* This watches includes and refreshes the build when they change */
	watcher([
		`${sitePath}/includes/*.pug`,
		`${sitePath}/templates/*.pug`,
	], () => Promise.all([
		builder.buildPages(),
		builder.buildPackages(),
	]));

	watcher([
		`${sitePath}/resources/css/*.css`,
		`${sitePath}/resources/js/*.js`,
	], builder.buildFreshResources);
}

async function main({ start }) {
    if (start) return builder.buildDocs().then(() => watch());

    /** The default action is build */
    return builder.buildDocs();
}

const {
	start = false
} = yargs(hideBin(process.argv)).option("start", {
	describe: "Start the development server",
	type: "boolean",
}).argv;

main({ start }).catch((err) => {
	console.error(err);
	process.exit(1);
});
