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

const fs = require('fs');
const { chdir } = require('process');
const path = require('path');
// @ts-ignore - no unused locals
const colors = require('colors');
const logger = require('gulplog');

const dirs = require('../lib/dirs');
const depUtils = require('../lib/depUtils');

/*
  Run the specified gulp task for the given package
*/
function runComponentTask(packageName, task, callback) {
  const cwd = process.cwd();
  // Drop org from package name
  packageName = packageName.split('/').pop();
  const packageDir = path.join(dirs.components, packageName);
  const print = `${packageName.yellow}:${task.yellow}`;
  const gulpfile = path.join(packageDir, 'gulpfile.js');

  if (!fs.existsSync(gulpfile)) {
    logger.warn(`${print} is not a buildable project. Skipping...`);
    callback();
    return;
  }

  chdir(packageDir);
  const tasks = require(gulpfile);
  if (!tasks || !tasks[task]) {
    chdir(cwd);
    callback(`Task '${print}' not found!`);
    return;
  }

  logger.warn(`Starting '${print}'...`);
  tasks[task]((err) => {
    chdir(cwd);

    if (err) {
      logger.error(`Error running '${print}'`, err);
      callback(err);
      return;
    }

    logger.warn(`Finished '${print}'`);
    callback();
    return;
  });
}

/*
  Run a task on every component in dependency order
*/
async function runTaskOnAllComponents(task) {
  const components = await depUtils.getFolderDependencyOrder(dirs.components);
  return runTaskOnPackages(task, components);
}

/*
  Run a task on every package
*/
function runTaskOnPackages(task, packages) {
  return new Promise(async (resolve, reject) => {
    let packageCount = packages.length;

    const processPackage = () => {
      const packageName = packages.shift();
      if (!packageName) return;

      return runComponentTask(packageName, task, (err) => {
        if (err && !process.env.FORCE) {
          reject(err);
          process.exit(1);
        }

        processPackage();
      });
    };

    processPackage();

    logger.warn(`${task} ran on ${packageCount} packages!`.bold.green);
    resolve();
  });
}

exports.buildComponents = () => runTaskOnAllComponents('build');
exports.runComponentTask = runComponentTask;
exports.runTaskOnPackages = runTaskOnPackages;
exports.runTaskOnAllComponents = runTaskOnAllComponents;
