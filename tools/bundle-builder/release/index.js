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
const fsp = require('fs').promises;
const { exec: execSync } = require('child_process');
const { promisify } = require('util');
const exec = promisify(execSync);

const del = require("del");

const dirs = require("../lib/dirs");
const updateDeps = require("./updateDeps");

Object.assign(exports, updateDeps)

exports.ghPages = async () => {
  // Get the version number from package.json
  const pkg = await fsp.readFile(`${process.cwd()}/package.json`).then(JSON.parse).catch(console.error);
  if (!pkg) Promise.reject('Could not read package.json');

  let stashRequired = false;
  let releaseVersion = pkg.version;

  // Check if the directory is clean
  const { stdout } = await exec(`git diff --name-only`);
  if (stdout) {
    stashRequired = true;
    await exec('git stash');
  }

  // Checkout the gh-pages branch
  await exec('git checkout gh-pages');
  await exec('git pull');

  // Copy the contents of the dist folder to the versioned directory
  await exec(`cp -r dist ${dirs.topLevel}/${releaseVersion}`);

  // @todo: update gh-pages index files if not alpha release
  await exec(`git add ${dirs.topLevel}/${releaseVersion}`);
  await exec(`git commit -q -m "Deploy version ${releaseVersion}"`);
  await exec('git push');

  // Go back to the previous branch
  await exec('git checkout -');

  // Pop changes to get Lerna's modification back
  if (stashRequired) await exec(`git stash pop`);
};

exports.releaseBackwardsCompat = async () => {
  await del(["icons", "vars"]);

  const promises = [];
  const fileNames = fsp.readdir(`${dirs.components}/icon/{medium,large,combined}`).catch(Promise.reject);
  for (const fileName of fileNames) {
    promises.push(
      fsp.copyFile(`${dirs.components}/icon/{medium,large,combined}/${fileName}`, `icons/${fileName}`)
    );
  }

  const iconDist = fsp.readdir(`${dirs.components}/icon/dist`).catch(Promise.reject);
  for (const fileName of iconDist) {
    if (!fileName.startsWith("spectrum-css-icons")) continue;
    promises.push(
      fsp.copyFile(`${dirs.components}/icon/dist/${fileName}`, `dist/icons/${fileName}`)
    );
  }

  const varsDist = fsp.readdir(`${dirs.components}/vars/dist`).catch(Promise.reject);
  for (const fileName of varsDist) {
    promises.push(
      fsp.copyFile(
        `${dirs.components}/vars/dist/${fileName}`,
        `vars/${fileName}`
      ),
      fsp.copyFile(
        `${dirs.components}/vars/dist/${fileName}`,
        `dist/vars/${fileName}`
      ),
    );
  }

  await Promise.all(promises).catch(Promise.reject);
};
exports.releaseBackwardsCompatCleanup = del(["icons", "vars"]);
