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

const StyleDictionary = require("style-dictionary").extend("config.js");
const fg = require("fast-glob");
const del = require("del");

async function concatIndex() {
  const writeStream = fsp.createWriteStream("dist/index.css", { flags: "w" });
  // eslint-disable-next-line no-restricted-syntax
  for (const file of await fg([
    "dist/css/*.css",
    "dist/css/spectrum/*.css",
    "dist/css/express/*.css",
    "custom-spectrum/*.css",
    "custom-express/*.css",
  ])) {
    writeStream.write(await fsp.readFile(file, "utf8"));
  }

  writeStream.close();
}

const buildCustoms = async () =>
  Promise.all([
    // build custom spectrum
    (await fg("custom-spectrum/*.css")).forEach((file) =>
      fsp.copyFile(file, `dist/css/spectrum/${path.basename(file)}`)
    ),
    // build custom express
    (await fg("custom-express/*.css")).forEach((file) =>
      fsp.copyFile(file, `dist/css/express/${path.basename(file)}`)
    ),
  ]);

exports.clean = del("dist/*");

exports.build =
  exports.buildLite =
  exports.buildMedium =
  exports.default =
  async () => await Promise.all([
    del("dist/*"),
    StyleDictionary.buildAllPlatforms(),
    buildCustoms(),
    concatIndex()
  ]);

exports.rebuildCustoms = async () => {
  await buildCustoms().catch(console.warn);
  return concatIndex().catch(console.warn);
};
