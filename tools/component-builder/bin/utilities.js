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

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const del = require("del");
const chalk = require("chalk");

export const isComponentDir = (cwd = process.cwd()) => {
  if (!cwd) return false;
  return cwd.includes("/components/");
};

export const isRootDir = async (cwd = process.cwd()) => {
  return fsp
    .access(path.join(cwd, "package.json"), fs.constants.R_OK)
    .catch(() => false)
    .then(() => {
      const { name } = require(path.join(cwd, "package.json"));
      return name === "spectrum-css-monorepo";
    });
};

export async function clean({ verbose = true, cwd = process.cwd() }) {
  if (verbose)
    console.log(
      chalk.yellow(`@spectrum-css/${cwd.split(path.sep).pop().trim()}`),
      `| cleaning compiled assets`
    );
  const deletedPaths = await del("dist/*", { cwd });
  if (verbose)
    console.log(`  ${chalk.green(`✓`)} ${deletedPaths.length} files deleted`);
  return Promise.resolve();
}

export const build = async ({ verbose = true, cwd = process.cwd() } = {}) => {
  return require("./css/index.js")({ verbose, cwd })
    .catch((err) => err && Promise.reject(err))
    .then(() => {
      return fsp
        .copyFile(
          path.join(cwd, "dist/index.css"),
          path.join(cwd, "dist/index-vars.css")
        )
        .then(() => {
          if (verbose)
            console.log(
              `  ${chalk.green("✓")} copied: ${chalk.gray(
                "dist/index.css"
              )} to ${chalk.magentaBright("dist/index-vars.css")}`
            );
        })
        .catch((err) => err && Promise.reject(err));
    });
};
