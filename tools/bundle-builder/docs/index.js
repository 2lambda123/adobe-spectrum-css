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
const pug = require("gulp-pug");
const data = require("gulp-data");

const dirs = require("../lib/dirs");

let minimumDeps = [
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
];

function buildSite_copyResources() {
	return gulp.src(`${dirs.site}/dist/**`).pipe(gulp.dest("dist/"));
}

function buildSite_copyFreshResources() {
	return gulp.src(`${dirs.site}/resources/**`).pipe(gulp.dest("dist/"));
}

function buildSite_html() {
	return gulp
		.src(`${dirs.site}/*.pug`)
		.pipe(
			data(function (file) {
				return {
					util: require(`${dirs.site}/util`),
					pageURL: path.basename(file.basename, ".pug") + ".html",
					dependencyOrder: minimumDeps,
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

function copySiteWorkflowIcons() {
	return gulp
		.src(
			path.join(
				path.dirname(require.resolve("@adobe/spectrum-css-workflow-icons")),
				"spectrum-icons.svg"
			)
		)
		.pipe(gulp.dest("dist/img/"));
}

exports.buildSite = gulp.parallel(
	buildSite_copyResources,
	gulp.series(buildSite_getData, buildSite_html)
);

exports.buildDocs = gulp.parallel(
	buildDocs_individualPackages,
	buildSite_copyResources,
	copySiteWorkflowIcons
);

exports.build = gulp.parallel(exports.buildDocs, buildSite_html);

exports.buildSite_copyResources = buildSite_copyResources;
exports.buildSite_copyFreshResources = buildSite_copyFreshResources;
exports.buildSite_html = buildSite_html;
exports.buildDocs_forDep = buildDocs_forDep;
