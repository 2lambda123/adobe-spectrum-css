/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fsp = require('fs').promises;
const path = require('path');

const exec = require('./exec');

/*
  Given a package path, get its dependencies

  @param {string} packages - package directory

  @return {Object} An object mapping the package name to its dependencies, or null if no dependencies
*/
async function getDependencies(package) {
  const { name, devDependencies } = await fsp.readFile(path.join(package, 'package.json')).then(JSON.parse);
  let dependencies = [];

  if (devDependencies) {
    dependencies = Object.keys(devDependencies).filter((dep) =>
      dep.indexOf('@spectrum-css') === 0 && !dep.includes('-builder')
    );
  }

  return { name, dependencies };
}

/*
  Get the list of all packages in given directory

  @param {string} packagesDir - directory of packages

  @return {Object} An array of package names in dependency order
*/
async function getFolderDependencyOrder(packagesDir) {
  // Get list of all packages
  const result = await exec.promise('lerna list --json --toposort --loglevel silent', { pipe: false }).then(JSON.parse);
  const packages = result.filter((meta) => ![
    /^@adobe\/*$/,
    /^@spectrum-css\/\w+-builder.*$/,
    /^@spectrum-css\/(generator|preview|documentation|spectrum-css)$/
  ].some((rgx) => meta.name.match(rgx)) && meta.location.includes(packagesDir));
  return packages.map((meta) => meta.name);
}

exports.getDependencies = getDependencies;
exports.getFolderDependencyOrder = getFolderDependencyOrder;
