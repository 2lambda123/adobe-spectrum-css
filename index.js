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

const semver = require("semver");
const fg = require("fast-glob");
const del = require("del");

const builder = require("@spectrum-css/bundle-builder");
const subrunner = builder.subrunner;

Object.assign(exports, builder);

// check all dependencies on the packages
async function checkPeerDependencies() {
  const packagesDir = "./components"
  // @todo could use fast-glob here
  const components = (await fsp.readdir(packagesDir, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory() || dirent.isSymbolicLink())
    .map((dirent) => path.join(packagesDir, dirent.name));

  if (!components.length) return Promise.reject();

  const promises = [];
  for (const componentPath of await fg('*', {
    cwd: "./components",
    absolute: true,
    onlyDirectories: true,
    isSymbolicLink: true,
  })) {
    const packagePath = path.join(componentPath, "package.json");
    const pack = await fsp.readFile(packagePath).then(JSON.parse).catch(console.trace);
    if (!pack || !pack.devDependencies || !pack.peerDependencies) continue;

    for (const dependency of Object.keys(pack.peerDependencies)) {
      const devDepVer = pack.devDependencies[dependency]?.replace("^", "")
      const peerDepVer = pack.peerDependencies[dependency];

      if (!devDepVer) {
        console.warn(`${path.basename(componentPath)} has ${dependency} in peerDependencies, but not devDependencies!`);
        continue;
      }

      if (!semver.satisfies(devDepVer, peerDepVer)) {
        console.log(`${path.basename(componentPath)} has out of date peerDependencies ${dependency} (found ${devDepVer}, does not satisfy ${peerDepVer})`);

        // Set a new peer dependency, stripping the beta version number
        const newPeerDepVer = "^" + devDepVer.replace(/-\d+$/, "");
        pack.peerDependencies[dependency] = newPeerDepVer;

        console.log(`  Updated ${dependency} to ${newPeerDepVer}`);
      }
    }

    promises.push(
      fsp.writeFile(packagePath, JSON.stringify(pack, null, 2))
    );
  }

  return Promise.all(promises).catch(console.warn);
}

exports.checkPeerDependencies = checkPeerDependencies;

exports.releaseBundles = async () => {
  const bundles = await fg('*', {
    cwd: "./bundles",
    absolute: true,
    onlyDirectories: true,
    isSymbolicLink: true,
  });

  await subrunner.runTaskOnPackages("release", bundles);
};

exports.graduatePeerDeps = async () => {
  const promises = [];
  for (const file of await fg('components/*/package.json')) {
    const data = fsp.readFile(file, 'utf8').then(JSON.parse).catch(console.trace);
    if (!data.peerDependencies) continue;

    for (let [peerDep, version] of Object.entries(data.peerDependencies)) {
      if (!version.match(/-(alpha)|(beta)/)) continue;

      version = version.replace('^', '');
      let newVersion = `^${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
      console.log(`${data.name}: Graduating ${peerDep} to ${newVersion}`);
      data.peerDependencies[peerDep] = newVersion;
    }

    promises.push(
      fsp.writeFile(file, JSON.stringify(data, null, 2))
    );
  }
  return Promise.all(promises);
}

exports.readmeLint = async () => {
  const components = await fg('*', {
    cwd: "./components",
    absolute: true,
    onlyDirectories: true,
    isSymbolicLink: true,
  });

  const promises = [];
  for (const component of components) {
    const hasReadme = await fsp.access(path.join(component, "README.md")).then(() => true).catch(() => false);
    if (hasReadme) continue;

    const pack = await fsp.readFile(path.join(component, "package.json")).then(JSON.parse).catch(console.trace);
    const writer = fsp.writeFile(path.join(component, "README.md"), `# ${pack.name}
> ${pack.description}

This package is part of the [Spectrum CSS project](https://github.com/adobe/spectrum-css).

See the [Spectrum CSS documentation](https://opensource.adobe.com/spectrum-css/) and [Spectrum CSS on GitHub](https://github.com/adobe/spectrum-css) for details.
`);
    promises.push(writer);
  }

  return Promise.all(promises);
}

exports.prepareSite = async () => {
  await del("dist-site/");
  return await Promise.all([
    (async () => {
      const promises = [];
      for (const file of await fg("dist/docs/**/*")) {
        const contents = await fsp.readFile(file, "utf8").catch(console.error);
        promises.push(
          fsp.writeFile(
            path.join("dist-site", file.replace("dist/", "")),
            contents.replace(
              "../components/",
              "components/"
            ),
            "utf8"
          ).catch(console.error)
        );
      }
    })(),
    (async () => {
      const promises = [];
      for (const file of await fg("dist/components/**/*")) {
        promises.push(
          fsp.copyFile(file, path.join("dist-site", file.replace("dist/", ""))).catch(console.error)
        );
      }
      return Promise.all(promises);
    })(),
  ]);
};

exports['watch-relaunch'] = () => {
  process.env['BROWSERSYNC_OPEN'] = true;
  return exports.watch();
};

exports.version = () =>
  checkPeerDependencies()
    .then(builder.build)
    .catch(console.warn);

exports.releaseBundles = async () => {
  const bundles = await fg('*', {
    cwd: "./bundles",
    absolute: true,
    onlyDirectories: true,
    isSymbolicLink: true,
  });

  return subrunner.runTaskOnPackages("release", bundles);
};

if (process.argv[2] === 'dev') { builder.dev() }
