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

const dirs = require("../lib/dirs");
const depUtils = require("../lib/depUtils");

/**
 * @description Run a task on a component
 * @param {string} packageName - The package directory name
 * @param {string} task - The task to run
 * @returns {Promise<any>}
 **/
async function runComponentTask(packageName, task) {
  const scriptPath = path.join(dirs.components, packageName, "index.js");
  const localTasks = require(`${scriptPath}`);
  if (!localTasks || !localTasks[task]) {
    return Promise.reject(`Task ${task} not found at ${scriptPath}`);
  }

  process.chdir(path.join(dirs.components, packageName));
  return localTasks[task]().then(Promise.resolve).catch(Promise.reject);
}

/**
 * @description Run a task on every component in dependency order
 * @param {string|Function} task - The task to run
 * @returns {Promise}
 * @todo this should be handled by lerna
**/
async function runTaskOnAllComponents(task) {
  const components = await depUtils.getFolderDependencyOrder(dirs.components).catch(console.error);
  if (!components.length) {
    return Promise.reject(new Error("No components found"));
  }

  return runTaskOnPackages(task, components.map((component) =>
    path.join(dirs.components, component.split("/").pop())
  ));
}

/**
 * @description Run a task on every package
 * @param {string} task - The task to run
 * @param {Array} packages - The packages to run the task on
 * @returns {Promise<void>}
**/
async function runTaskOnPackages(task, packages) {
  const packageLength = packages.length;
  const cwd = process.cwd();
  async function processPackage() {
    const packageName = packages.shift();
    if (!packageName) return Promise.resolve();

    process.chdir(cwd);
    return runComponentTask(packageName, task).then(processPackage)
      .catch(err => err && !process.env.FORCE && process.exit(1));
  }

  return processPackage().then(
    () => console.log(`${task} successfully run on ${packageLength} packages.`)
  ).catch(console.error);
}

exports.buildComponents = () => runTaskOnAllComponents("build");
exports.runComponentTask = runComponentTask;
exports.runTaskOnPackages = runTaskOnPackages;
exports.runTaskOnAllComponents = runTaskOnAllComponents;
