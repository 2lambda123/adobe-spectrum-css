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

const { existsSync } = require("fs");
const path = require("path");
const fsp = require("fs").promises;

async function cleanSite() {
  const dist = path.join(__dirname, "dist/");
  if (existsSync(dist)) return fsp.rm(dist, { recursive: true });
  return Promise.resolve();
}

async function buildSite_resources() {
  const dirpath = path.join(__dirname, "resources/");
  const destination = path.join(__dirname, "dist/");
  if (!existsSync(dirpath))
    return Promise.reject(new Error("No resources directory found."));

  if (!existsSync(destination)) fsp.mkdir(destination, { recursive: true });
  return fsp.cp(dirpath, destination);
}

async function buildSite_loadicons(path) {
  const iconLoader = require.resolve("loadicons");
  if (!existsSync(iconLoader))
    return Promise.reject(new Error("No loadicons dependency found."));

  const destination = path.join(__dirname, "dist/js/loadicons/");
  if (!existsSync(destination)) fsp.mkdir(destination, { recursive: true });
  return fsp.copyFile(iconLoader, destination);
}

async function buildSite_focusPolyfill() {
  const polyfill = require.resolve("@adobe/focus-ring-polyfill");
  if (!existsSync(polyfill))
    return Promise.reject(
      new Error("No focus-ring-polyfill dependency found.")
    );

  const destination = path.join(__dirname, "dist/js/focus-ring-polyfill/");
  if (!existsSync(destination)) fsp.mkdir(destination, { recursive: true });
  return fsp.copyFile(polyfill, destination);
}

async function buildSite_lunr() {
  const lunr = require.resolve("lunr");
  if (!existsSync(lunr))
    return Promise.reject(new Error("No lunr dependency found."));
  return fsp.copyFile(lunr, path.join(__dirname, "dist/js/lunr/"));
}

async function buildSite_prism() {
  const promises = [];
  const prism = require.resolve("prismjs");
  ["prism", "prism-dark"].forEach((theme) => {
    const filepath = path.join(prism, `/themes/${theme}.css`);
    if (existsSync(filepath)) {
      promises.push(
        fsp.copyFile(filepath, path.join(__dirname, "dist/css/prism/"))
      );
    }
  });
  return Promise.all(promises);
}

exports.default = async () => {
  await cleanSite();
  await Promise.all(
    buildSite_resources(),
    buildSite_loadicons(),
    buildSite_focusPolyfill(),
    buildSite_lunr(),
    buildSite_prism()
  );
};
