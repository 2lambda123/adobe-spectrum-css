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

const path = require("path");

const fg = require("fast-glob");
const del = require("del");

const concat = require("concat-stream");

const depUtils = require("./lib/depUtils");
const exec = require("./lib/exec")
const dirs = require("./lib/dirs")
const docs = require("./docs")
const dev = require("./dev")
const subrunner = require("./subrunner")
const release = require("./release")
const vars = require("./vars")

async function clean() {
  const globs = [
    'dist/components',
    'dist/docs/*.html',
    'dist/docs/*.json',
    '!dist/docs/get-started.html',
    '!dist/docs/index.html',
    '!dist/preview'
  ];

  // Don't delete the dist folder inside of installed packages
  if (dirs.isTopLevel) globs.push(`${dirs.components}/*/dist/*`);
  return del(globs);
}

function concatPackageFiles(taskName, input, output, directory) {
  const func = async () => {
    const srcFiles = [];
    for (const dep of await getDependencyOrder()) {
      const files = await fg(input, {
        onlyFiles: true,
        cwd: path.dirname(require.resolve(`${dep}/package.json`)),
        absolute: true,
      }) || [];
      srcFiles.push(...files);
    }

    concat(srcFiles, path.join("dist", directory || "", output)).catch(console.error);
  }

  Object.defineProperty(func, "name", { value: taskName, writable: false });

  return func;
}


async function getDependencyOrder() {
  return depUtils.getFolderDependencyOrder(dirs.components);
}

const buildCombined = Promise.all([
  concatPackageFiles('buildCombined_core', ['index.css'], 'spectrum-core.css'),
  concatPackageFiles('buildCombined_large', ['index-lg.css'], 'spectrum-core-lg.css'),
  concatPackageFiles('buildCombined_diff', ['index-diff.css'], 'spectrum-core-diff.css'),
  concatPackageFiles('buildCombined_light', ['multiStops/light.css'], 'spectrum-light.css'),
  concatPackageFiles('buildCombined_lightest', ['multiStops/lightest.css'], 'spectrum-lightest.css'),
  concatPackageFiles('buildCombined_dark', ['multiStops/dark.css'], 'spectrum-dark.css'),
  concatPackageFiles('buildCombined_darkest', ['multiStops/darkest.css'], 'spectrum-darkest.css')
]);

const buildStandalone = Promise.all([
  concatPackageFiles('buildStandalone_light', ['index.css', 'colorStops/light.css' ], 'spectrum-light.css', 'standalone/'),
  concatPackageFiles('buildStandalone_lightest', ['index.css', 'colorStops/lightest.css' ], 'spectrum-lightest.css', 'standalone/'),
  concatPackageFiles('buildStandalone_dark', ['index.css', 'colorStops/dark.css' ], 'spectrum-dark.css', 'standalone/'),
  concatPackageFiles('buildStandalone_darkest', ['index.css', 'colorStops/darkest.css' ], 'spectrum-darkest.css', 'standalone/'),
  concatPackageFiles('buildStandalone_lightLarge', ['index-lg.css', 'colorStops/light.css' ], 'spectrum-light-lg.css', 'standalone/'),
  concatPackageFiles('buildStandalone_lightestLarge', ['index-lg.css', 'colorStops/lightest.css' ], 'spectrum-lightest-lg.css', 'standalone/'),
  concatPackageFiles('buildStandalone_darkLarge', ['index-lg.css', 'colorStops/dark.css' ], 'spectrum-dark-lg.css', 'standalone/'),
  concatPackageFiles('buildStandalone_darkestLarge', ['index-lg.css', 'colorStops/darkest.css' ], 'spectrum-darkest-lg.css', 'standalone/'),
]);

async function copyPackages(exclude = []) {
  const promsies = [];
  for (const filePath of await fg([
    `*/package.json`,
    `*/dist/**`,
    ...exclude.map((e) => `!${e}`),
  ], {
    absolute: true,
    cwd: dirs.components,
  })) {
    const parts = filePath.split("/");
    let finalDestination;

    if (filePath.includes(`dist/`)) {
      const indexOfDist = parts.indexOf("dist");
      if (indexOfDist !== -1) parts.splice(indexOfDist, 1);
      finalDestination = [
        parts.slice(0, parts.indexOf("components")),
        'dist',
        parts.slice(parts.indexOf("components")),
      ].flat().join("/");
    } else {
      const newFilePath = parts.slice(parts.indexOf("components")).join("/");
      if (!newFilePath) continue;
      finalDestination = `dist/${newFilePath}`
    }

    promsies.push(fsp.copyFile(filePath, finalDestination));
  }
  return Promise.all(promsies).catch();
}

async function buildIfTopLevel() {
  const builtTasks = async () =>
    Promise.all([
      docs.build(),
      buildCombined,
      buildStandalone,
      copyPackages()
    ]).catch(console.error);

  if (dirs.isTopLevel) {
    // Run a build for all packages first
    await subrunner.buildComponents().catch(console.error);
    await builtTasks().catch(console.error);
  }

  // They're already built, just include the output
  return builtTasks;
}

const build = async () => {
  await clean().catch(console.warn);
  await buildIfTopLevel().catch(console.warn);
  return vars.copyVars().catch(console.warn);
}

/**
 *
 * @param {'lite', 'medium', 'heavy'} scope
 * @returns {Promise<void>}
 */
const buildScope = async (scope = "medium") => {
  let type = 'buildLite';
  if (scope === 'medium') {
    type = 'buildMedium';
  } else if (scope === 'heavy') {
    type = 'buildHeavy';
  }

  await clean().catch(console.warn);
  await subrunner.runTaskOnAllComponents(type).catch(console.error);
  return Promise.all([
    docs.build(),
    copyPackages(),
  ]);
}

exports.devHeavy = async () => {
  await buildScope('heavy').catch(console.warn);
  return dev.watch();
}

exports.copyVars = vars.copyVars;

exports.prePack = async () => {
  await build().catch(console.error);
  await release.releaseBackwardsCompat().catch(console.error);
};

exports.release = async () => {
  return new Promise(async (resolve, reject) => {
    await release.updateAndTagRelease().catch(reject);
    exec.task("yarnInstall", "yarn install --frozen-lockfile");
    await build().catch(reject);
    exec.task("npmPublish", "npm publish");
    exec.task("gitPush", "git push");
    resolve();
  });
}

exports.generateChangelog = release.generateChangelog;
exports.buildUniqueVars = vars.buildUnique;

exports.ghPages = release.ghPages;
exports.postPublish = release.releaseBackwardsCompatCleanup;

exports.buildComponents = subrunner.buildComponents;
exports.buildLite = buildScope.bind(null, 'lite');
exports.buildDocs = docs.buildDocs;
exports.copyPackages = copyPackages;

exports.dev = dirs.isTopLevel ? buildScope('lite') : async () => {
  await clean().catch(console.warn);
  await Promise.all([
    docs.build(),
    copyPackages()
  ]).catch(console.warn);
  return dev.watch();
};

exports.clean = clean;
exports.build = build;
exports.watch = dev.watch;
exports.default = buildScope.bind(null, 'medium');

exports.updateAndTagRelease = release.updateAndTagRelease;
