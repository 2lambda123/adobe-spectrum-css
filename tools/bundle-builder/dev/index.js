/*
Copyright 2022 Adobe. All rights reserved.
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

const browserSync = require("browser-sync");
const chokidar = require("chokidar");

const logger = require("../lib/logger");
const dirs = require("../lib/dirs");
const docs = require("../docs");
const subrunner = require("../subrunner");
const bundleBuilder = require("../index.js");

function watchWithinPackages(globContent, task, files) {
  const watcher = chokidar.watch(globContent, {
    // Chokidar will follow symlinked deps leading to infinite loops
    followSymlinks: false,
  });

  watcher.on("all", (done, changedFile) => {
    const packageName = changedFile.match(`${dirs.components}/(.*?)/`)[1];
    if (typeof task === 'function') {
      return task(changedFile, packageName, done);
    }

    return subrunner.runComponentTask(packageName, task)
      .then(() =>
        fsp.copyFile(
          `${dirs.components}/${packageName}/dist/${files}`,
          `dist/components/${packageName}/`
        ).then(browserSync.reload).catch(done)
      ).catch(done);
  });
}

function watchSite() {
  // *.njk in site`dss
  chokidar.watch([
    "*.njk",
    "includes/*.njk",
  ], {
    cwd: dirs.site,
  }, async (eventType) => {
    if (eventType === "change") {
      await docs.buildSite_pages();
      // @todo run this on includes changes?
    //   docs.buildSite_html();
    //   docs.buildDocs();
      browserSync.reload();
    }
  });

  // templates/siteComponent.njk
  chokidar.watch([
    "templates/siteComponent.njk",
    "util.js",
  ], {
    cwd: dirs.site,
  }, async (eventType) => {
    if (eventType === "change") {
      docs.buildDocs();
      browserSync.reload();
    }
  });

  chokidar.watch([
    "resources/css/*.css",
    "resources/js/*.js",
  ], {
    cwd: dirs.site,
  }, async (eventType) => {
    if (eventType === "change") {
      docs.buildSite_copyFreshResources();
      const cssFiles = fs.readdirSync(path.join('dist', 'docs', 'css')).filter((fl) => fl.endsWith('.css'));
      const jsFiles = fs.readdirSync(path.join('dist', 'docs', 'js')).filter((fl) => fl.endsWith('.js'));
      [...cssFiles, ...jsFiles].forEach((fl) => {
        browserSync.stream(path.join('dist', 'docs', fl));
      });
    }
  });
}

exports.watch = () => {
  browserSync({
    startPath: "docs/index.html",
    server: `${process.cwd()}/dist/`,
    notify: process.env.BROWSERSYNC_NOTIFY === "true",
    open: process.env.BROWSERSYNC_OPEN === "true",
    port: process.env.BROWSERSYNC_PORT ?? 3000,
  });

  // Watch common css utilities & rebuild assests if changed
  chokidar.watch(`commons/*.css`, {
    cwd: dirs.components,
  }, async (eventType) => {
    if (eventType === "change") {
      await subrunner.runTaskOnPackages("buildLite", ['actionbutton', 'button', 'clearbutton', 'closebutton', 'infieldbutton', 'logicbutton', 'picker', 'pickerbutton']);
      await bundleBuilder.copyPackages();
      browserSync.reload();
    }
  })

  watchWithinPackages(`${dirs.components}/tokens/custom-*/*.css`, 'rebuildCustoms', '*.css');

  watchWithinPackages(`${dirs.components}/*/{index,skin}.css`, 'buildMedium', '*.css');
  watchWithinPackages(`${dirs.components}/*/themes/{spectrum,express}.css`, 'buildMedium', '*.css');

  watchWithinPackages(
    [
      `${dirs.components}/*/metadata/*.yml`,
      `${dirs.components}/*/metadata.yml`,
    ],
    async (_changedFile, packageContent, done) => {
      logger.debug(`Building nav data for ${packageContent}`)
      await docs.buildSite_getData();
      logger.debug(`Building docs for ${packageContent}`)
      await docs.buildDocs_forDep(packageContent);
      browserSync.reload();
      done();
    }
  )

  watchSite();
}
