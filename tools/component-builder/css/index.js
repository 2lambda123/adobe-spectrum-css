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
const path = require('path');

const postcss = require("postcss");
const fg = require("fast-glob");

const processors = require("./processors").processors;
// const legacyBuild = require('./legacyBuild');
const { bakeVars } = require("./vars");

// Read in all variables used
// Read in all vars from recent DNA
// Include definitions if they refer to a variable, static if not
async function buildIndexVars() {
  const writePath = path.join("dist", "index-vars.css");
  const writeStream = fsp.createWriteStream(writePath, { flags: "w" });
  // Allow missing skin.css
  for (const file of await fg(["index.css", "skin.css"])) {
    writeStream.write(await fsp.readFile(file, "utf-8"));
  }

  writeStream.close();
  const contents = await fsp.readFile(writePath, "utf-8");
  const result = await postcss(processors).process(contents, { from: 'index.css' }).then((result) => result.css).catch(console.error);
  return fsp.writeFile(writePath, result);
}

exports.buildIndexVars = buildIndexVars;
exports.buildVars = async function () {
  await buildIndexVars().catch(console.warn);
  return bakeVars().catch(console.warn);
};

exports.buildCSS = async function () {
  await buildIndexVars().catch(console.warn);
  await bakeVars().catch(console.warn);
  return fsp.copyFile("dist/index-vars.css", "dist/index.css").catch(console.warn);
}
