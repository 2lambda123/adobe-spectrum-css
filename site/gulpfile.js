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

const gulp = require("gulp");
const pug = require("gulp-pug");
const data = require("gulp-data");

const pug = require("pug");
const yaml = require("js-yaml");
const through = require("through2");
const ext = require("replace-ext");

const lunr = require("lunr");

const npmFetch = require("npm-registry-fetch");
const browserSync = require("browser-sync");

let templateData = {
	nav: [],
	pkg: require("package.json"),
};

function serve() {
	let PORT = 3000;

	if (process.env.BROWSERSYNC_PORT) {
		PORT = process.env.BROWSERSYNC_PORT;
		logger.info(
			`Setting '${PORT} as port for browsersync, which hopefully is valid`
		);
	}

	if (process.env.BROWSERSYNC_OPEN === "true") {
		logger.info("New browser instance will open");
	}

	browserSync({
		startPath: "index.html",
		server: `${process.cwd()}/dist/`,
		notify: process.env.BROWSERSYNC_NOTIFY === "true" ? true : false,
		open: process.env.BROWSERSYNC_OPEN === "true" ? true : false,
		port: PORT,
	});
}

async function getDependencies(packagePath) {
	if (!packagePath || !fs.existsSync(path.join(packagePath, "package.json"))) return;

	const package = require(path.join(packagePath, "package.json"));

	let dependencies = [];

	if (package.devDependencies) {
		dependencies = Object.keys(package.devDependencies);

		dependencies = dependencies
			.filter((dep) => {
				return (
					dep.indexOf("@spectrum-css") === 0 &&
					dep !== "@spectrum-css/component-builder" &&
					dep !== "@spectrum-css/component-builder-simple"
				);
			})
			.map((dep) => dep.split("/").pop());
	}

	return { package, dependencies };
}

async function buildSite_component(dep) {
	const { package, dependencies } = await getDependencies(process.cwd());

	if (!dep) dep = package.name.split("/").pop();

	const dirName = path.dirname(require.resolve(path.join(dep, "package.json")));
	const dependencyOrder = await depUtils.getPackageDependencyOrder(dirName);

	const componentDeps = [
		...dependencyOrder.map((dep) => dep.split("/").pop()),
		dep,
	];

	const docsDeps = [...new Set([
		"icon",
		"statuslight",
		"link",
		"page",
		"site",
		"typography",
		"tooltip",
		"sidenav",
		"actionbutton",
		"button",
		"textfield",
		"clearbutton",
		"search",
		"menu",
		"fieldlabel",
		"picker",
		"popover",
		"underlay",
		"card",
		"divider",
		"illustratedmessage",
		"accordion",
		"table",
		componentDeps
	])];

	let date;
	try {
		const data = await npmFetch.json(package.name);
		date = data.time[package.version];
		date = new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch (err) {
		date = "Unreleased";
		logger.error(
			`Could not determine date of release for ${package.name}@${package.version}`
		);
	}

	return gulp
		.src([ "metadata/*.yml" ], { cwd: dirName, allowEmpty: true })
		.pipe(
			data(() => ({
				dependencies,
				dnaVars: require("@spectrum-css/vars"),
				util: require(`${__dirname}/util`),
				...templateData,
				pageURL: path.basename(file.basename, ".yml") + ".html",
				dependencyOrder: docsDeps,
				releaseDate: date,
				pkg: package,
			}))
		)
		.pipe(
			through.obj(function compilePug(file) {
				const data = {
					component: yaml.load(String(file.contents)),
					...file.data ?? {}
				};

				data.component.id = path.basename(file.basename, ".yml");

				file.path = ext(file.path, ".html");

				const templatePath = `${__dirname}/templates/individualComponent.pug`;
				// const templatePath = `${__dirname}/templates/siteComponent.pug`;
				let compiled = pug.renderFile(templatePath, data);
				file.contents = Buffer.from(compiled);
			})
		)
		.pipe(gulp.dest(path.join(__dirname, "../dist/")))
		.on("end", resolve)
		.on("error", reject);
}

function buildSite_generateIndex() {
	return gulp
		.src([
			`components/*/metadata/*.yml`,
		], {
			cwd: path.join(__dirname, "../"),
			allowEmpty: true
		})
		.pipe(
			(function () {
				let docs = [];
				let store = {};
				let latestFile = null;
				function readYML(file, enc, cb) {
					let componentData;
					try {
						componentData = yaml.load(String(file.contents));
					} catch (err) {
						return cb(err);
					}

					const componentName = file.dirname
						.replace("/metadata", "")
						.split("/")
						.pop();

					const fileName = ext(file.basename, ".html");

					docs.push({
						href: fileName,
						name: componentData.name,
						description: componentData.description,
					});

					store[fileName] = {
						href: fileName,
						name: componentData.name,
						component: componentName,
						description: componentData.description,
					};

					latestFile = file;

					cb();
				}

				function endStream(cb) {
					let indexFile = latestFile.clone({ contents: false });
					indexFile.path = path.join(latestFile.base, "index.json");

					let index = lunr(function () {
						this.ref("href");
						this.field("name", { boost: 10 });
						this.field("description");

						docs.forEach(function (doc) {
							this.add(doc);
						}, this);
					});

					// Note: could merge main index here using technique from https://www.garysieling.com/blog/building-a-full-text-index-in-javascript

					indexFile.contents = Buffer.from(JSON.stringify(index));
					this.push(indexFile);

					let storeFile = latestFile.clone({ contents: false });
					storeFile.path = path.join(latestFile.base, "store.json");
					storeFile.contents = Buffer.from(JSON.stringify(store));
					this.push(storeFile);

					cb();
				}

				return through.obj(readYML, endStream);
			})()
		)
		.pipe(gulp.dest("dist/"));
}

function buildSite_getData() {
	let nav = [];
	return gulp
		.src([
			`components/*/metadata/*.yml`,
		], {
			cwd: path.join(__dirname, "../"),
			allowEmpty: true
		})
		.pipe(
			through.obj(function readYML(file, enc, cb) {
				const componentData = yaml.load(String(file.contents));
				const componentName = file.dirname
					.replace("/metadata", "")
					.split("/")
					.pop();

				if (path.basename(file.basename) === "metadata.yml") {
					file.basename = componentName;
				}

				const fileName = ext(file.basename, ".html");
				nav.push({
					name: componentData.name,
					component: componentName,
					hide: componentData.hide,
					fastLoad: componentData.fastLoad,
					href: fileName,
					description: componentData.description,
				});

				cb(null, file);
			})
		)
		.on("end", function () {
			templateData.nav = nav.sort(function (a, b) {
				return a.name <= b.name ? -1 : 1;
			});
		});
}

function buildSite_pages() {
	return gulp
		.src(`*.pug`)
		.pipe(
			data(function (file) {
				return {
					util: require(`./util`),
					pageURL: path.basename(file.basename, ".pug") + ".html",
					dependencyOrder: [
						"icon",
						"statuslight",
						"link",
						"page",
						"site",
						"typography",
						"tooltip",
						"sidenav",
						"actionbutton",
						"button",
						"textfield",
						"clearbutton",
						"search",
						"menu",
						"fieldlabel",
						"picker",
						"popover",
						"underlay",
						"card",
						"divider",
						"illustratedmessage",
						"accordion",
						"table",
					],
				};
			})
		)
		.pipe(
			pug({
				locals: templateData,
			})
		)
		.pipe(gulp.dest("dist/"));
}

function buildSite_copyResources() {
	return gulp
		.src(path.join(__dirname, "resources/**"))
		.pipe(gulp.dest(path.join(__dirname, "../dist/")));
}

function buildSite_copyLoadicons() {
	return gulp
		.src(require.resolve("loadicons"))
		.pipe(gulp.dest(path.join(__dirname, "../dist/js/loadicons/")));
}

function buildSite_copyLunr() {
	return gulp
		.src(require.resolve("lunr"))
		.pipe(gulp.dest(path.join(__dirname, "../dist/js/lunr/")));
}

function buildSite_copyPrism() {
	return gulp
		.src([
			`${path.dirname(require.resolve("prismjs"))}/themes/prism.css`,
			`${path.dirname(require.resolve("prismjs"))}/themes/prism-dark.css`,
		])
		.pipe(gulp.dest(path.join(__dirname, "../dist/css/prism/")));
}

function buildSite_copyTokens() {
	return gulp
		.src([
			require.resolve("@spectrum-css/tokens"),
		])
		.pipe(gulp.dest(path.join(__dirname, "../dist/components/tokens/")));
}

function buildSite_copyResources() {
	return gulp.src(`./dist/**`).pipe(gulp.dest("dist/"));
}

function buildSite_copyWorkflowIcons() {
	return gulp
		.src(
			path.join(
				path.dirname(require.resolve("@adobe/spectrum-css-workflow-icons")),
				"spectrum-icons.svg"
			)
		)
		.pipe(gulp.dest("dist/img/"));
}

exports.default = exports.build = gulp.series(
	buildSite_getData,
	gulp.parallel(
		buildSite_generateIndex,
		async () => {
			const dependencies = await depUtils.getFolderDependencyOrder(dirs.components);
			const promises = dependencies.map(buildSite_component);
			return Promise.all(promises);
		},
		buildSite_pages,
		gulp.parallel(
			buildSite_copyWorkflowIcons,
			buildSite_copyResources,
			buildSite_copyTokens,
			buildSite_copyLoadicons,
			buildSite_copyLunr,
			buildSite_copyPrism
		),
	)
);
