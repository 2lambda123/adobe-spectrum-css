/*
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

const yaml = require("js-yaml");
const fg = require("fast-glob");

const { json } = require('npm-registry-fetch');
const fetchDNA = require('../fetchDNA.js');

// was: buildDocs_forDep/buildDocs_individualPackages
module.exports = async () => {
  const isMigrated = (devDeps) => {
    if (devDeps["@spectrum-css/component-builder-simple"]) return true;
    return false;
  };

  const pages = [];
  const root_folder = path.join(__dirname, "../../components");
  for await (const path of fg.stream(`${root_folder}/*`, { onlyDirectories: true })) {
    const componentName = path.split("/").pop();
    const pkgData = await fsp.readFile(`${path}/package.json`, "utf8").then(JSON.parse).catch(console.warn);
    if (!pkgData) continue;

    /* Get the release date of the package using npmFetch */
    const date = await json(pkgData.name)
      .then((data) => {
        const datetime = data.time[pkgData.version];
        return new Date(datetime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      })
      .catch(() => {
        logger.error(`Could not determine date of release for ${pkgData.name}@${pkgData.version}`);
        return 'Unreleased';
      });


    let dependencies = [];
    if (pkgData.devDependencies) {
      dependencies = Object.keys(pkgData.devDependencies).filter((dep) => {
        return dep.indexOf('@spectrum-css') === 0 && !dep.includes('-builder');
      });
    }

    const dependencyOrder = Object.keys(pkgData.peerDependencies) || [];
    const componentDeps = dependencyOrder.map((dep) => dep.split('/').pop()).filter((dep, i) => componentDeps.indexOf(dep) === i) || [];

    for await (const file of fg.stream('metadata/*.yml', { cwd: path, onlyFiles: true })) {
      const componentData = await fsp.readFile(file, "utf8").then(yaml.safeLoad).catch(console.warn);
      if (!componentData) continue;

      componentData.id = componentData.id || basename(file, '.yml') === 'metadata' ? componentName : basename(file, '.yml');

      let examples = !componentData.examples ? [componentData] : componentData.examples;
      if (!Array.isArray(examples)) {
        examples = Object.values(examples);
      }

      examples = examples.map((example) => {
        let status = 'Contribution';
        const { dnaStatus, cssStatus } = example;
        if (dnaStatus === 'Deprecated' || cssStatus === 'Deprecated') {
          status = 'Deprecated';
        } else if (cssStatus === 'Verified' || dnaStatus === 'Canon') {
          status = 'Verified';
        }

        return { ...example, status };
      });

      const fullData = {
        ...fetchDNA(componentData) || {},
        title: componentData.name,
        pageURL: basename(file.basename, '.yml') + '.html',
        name: componentName,
        migrated: isMigrated(pkgData.devDependencies),
        dependencies,
        dependencyOrder: componentDeps,
        packageName: pkgData.name,
        version: pkgData.version,
        path,
        examples,
        releaseDate: date,
      };

      pages.push(fullData);
    }
  }

  return pages;
};
