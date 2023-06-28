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

const gulp = require("gulp");
const rename = require("gulp-rename");

const path = require("path");

const componentPath = path.join(__dirname, "../components");
const sitePath = __dirname;

function serve() {
	return browserSync({
		startPath: "index.html",
		server: `${process.cwd()}/dist/`,
		notify: process.env.BROWSERSYNC_NOTIFY === "true" ? true : false,
		open: process.env.BROWSERSYNC_OPEN === "true" ? true : false,
		port: process.env.BROWSERSYNC_PORT ?? 3000,
	});
}

function buildSite_resources() {
	return gulp
		.src(path.join(__dirname, "resources/**"))
		.pipe(gulp.dest(path.join(__dirname, "../dist/")));
}

function copyPackages() {
	return gulp
		.src([
			`${componentPath}/*/package.json`,
			`${componentPath}/*/dist/**`,
			`!${componentPath}/*/dist/docs/**`,
		])
		.pipe(
			rename(function (file) {
				file.dirname = file.dirname.replace("/dist", "");
			})
		)
		.pipe(gulp.dest("dist/components/"));
}

function buildSite_loadicons() {
	return gulp
		.src(require.resolve("loadicons"))
		.pipe(gulp.dest(path.join(__dirname, "../dist/js/loadicons/")));
}

function buildSite_focusPolyfill() {
	return gulp
		.src(require.resolve("@adobe/focus-ring-polyfill"))
		.pipe(gulp.dest(path.join(__dirname, "../dist/js/focus-ring-polyfill/")));
}

function buildSite_lunr() {
	return gulp
		.src(require.resolve("lunr"))
		.pipe(gulp.dest(path.join(__dirname, "../dist/js/lunr/")));
}

function buildSite_prism() {
	return gulp
		.src([
			`${path.dirname(require.resolve("prismjs"))}/themes/prism.css`,
			`${path.dirname(require.resolve("prismjs"))}/themes/prism-dark.css`,
		])
		.pipe(gulp.dest(path.join(__dirname, "../dist/css/prism/")));
}

function buildSite_getData() {
	const nav = [];
	return gulp
		.src([
			`${componentPath}/*/metadata.yml`,
			`${componentPath}/*/metadata/*.yml`,
		])
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

const buildSite_html = () =>
	gulp
		.src(`${sitePath}/*.pug`)
		.pipe(
			data((file) => ({
				util: require(`${sitePath}/util`),
				pageURL: path.basename(file.basename, ".pug") + ".html",
				dependencyOrder: minimumDeps,
			}))
		)
		.pipe(
			pug({
				locals: templateData,
			})
		)
		.pipe(gulp.dest("dist/"));

function reload(cb) {
	browserSync.reload();
	if (cb) {
		cb();
	}
}

function watch() {
	gulp.watch(
		`${sitePath}/*.pug`,
		gulp.series(buildSite_getData, buildSite_html, reload)
	);

	gulp.watch(
		`${sitePath}/includes/*.pug`,
		gulp.series(
			gulp.parallel(
				buildSite_html,
				gulp.series(
					buildSite_getData,
					gulp.parallel(
						buildSite_generateIndex,
						buildDocs_individualPackages,
						buildSite_copyResources,
						copySiteWorkflowIcons
					)
				)
			),
			reload
		)
	);

	gulp.watch(
		[`${sitePath}/templates/siteComponent.pug`, `${sitePath}/util.js`],
		gulp.series(gulp.parallel(docs.buildDocs), reload)
	);

	gulp.watch(
		[`${sitePath}/resources/css/*.css`, `${sitePath}/resources/js/*.js`],
		gulp.series(
			docs.buildSite_copyFreshResources,
			function injectSiteResources() {
				return gulp
					.src(["dist/css/**/*.css", "dist/js/**/*.js"])
					.pipe(browserSync.stream());
			}
		)
	);

	let changedFile = null;
	gulp
		.watch(
			[`${componentPath}/*/metadata/*.yml`, `${componentPath}/*/metadata.yml`],
			{
				// Otherwise we get infinite loops because chokidar gets all crazy with symlinked deps
				followSymlinks: false,
			},
			(done) => {
				if (!changedFile) {
					done();
					return;
				}

				const packageName = getPackageFromPath(changedFile);

				// Do this as gulp tasks to avoid premature stream termination
				try {
					gulp.series(
						// Get data first so nav builds
						function buildSite_getData() {
							logger.debug(`Building nav data for ${packageName}`);
							return docs.buildSite_getData();
						},
						function buildDocs_forDep() {
							logger.debug(`Building docs for ${packageName}`);
							return docs.buildDocs_forDep(packageName);
						}
					)();
				} catch (error) {
					// this catches yaml parsing errors
					// should stop the series from running
					done(error);
					changedFile = null;
				} finally {
					// we have to do this
					// or gulp will get wedged by the error
					done();
					changedFile = null;
					reload();
				}
			}
		)
		.on("change", (filePath) => {
			if (changedFile === null) {
				changedFile = filePath;
			}
		});
}

exports.serve = serve;

exports.dev = gulp.series(
	exports.copySiteResources,
	gulp.parallel(serve, watch)
);

exports.copySiteResources = gulp.parallel(
	buildSite_resources,
	copyPackages,
	buildSite_loadicons,
	buildSite_focusPolyfill,
	buildSite_lunr,
	buildSite_prism
);
