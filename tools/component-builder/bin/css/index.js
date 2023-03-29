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
const fs = require("fs");
const fsp = fs.promises;

const postcssrc = require("postcss-load-config");
const postcss = require("postcss");

const fg = require("fast-glob");
const chalk = require("chalk");

const validateTokenUse = require("./validate.js");
const { expressWritten } = require("./express.js");

/**
 * @description Process raw CSS with PostCSS and write the result to a file
 * @param {Promise<string>} inputCSS
 * @param {Object} config The PostCSS config to pass to postcss-load-config
 * @param {boolean} verbose
 * @returns {Promise<string>}
 */
const process = async (inputCSS, config, verbose = true) => {
  const { plugins, options } = await postcssrc(
    config,
    path.join(__dirname, "../")
  );
  const processedCSS = await postcss(plugins)
    .process(await inputCSS, options)
    .then((result) => result.css);
  // if (verbose) console.log(`  ${chalk.green('✓')} process with postcss`);

  if (!config.to) return processedCSS;

  // Write the processed CSS to a file
  return fsp
    .writeFile(config.to, processedCSS)
    .catch((err) => err && Promise.reject(err))
    .then(() => {
      if (verbose)
        console.log(
          `  ${chalk.green("✓")} write to: ${chalk.magentaBright(config.to)}`
        );
      return processedCSS;
    });
};

/**
 * @description method to combine css files
 * @param {{ filePath: { content: Promise<string>, isTheme: boolean }}} promises array of css files to combine
 * @param {object} options
 * @param {boolean} options.verbose flag to print the version of the package (default: true)
 * @returns {Promise<string>}
 **/
const combineResults = async (
  promises,
  { cwd = process.cwd(), filter = () => true, verbose = true }
) => {
  const assets =
    Object.entries(promises)
      .filter(filter)
      .map(([filePath]) => filePath) || [];

  /* Extract the content promises from the dataset */
  const content = Object.entries(promises)
    .filter(filter)
    .map(([, { content }]) => content);

  /* Wait for all the promises to resolve and then combine the results */
  return Promise.all(content)
    .then((results) => {
      if (verbose && assets)
        console.log(
          `  ${chalk.green("✓")} combine: ${chalk.magentaBright(
            `${assets.map((f) => path.relative(cwd, f)).join(", ")}`
          )}`
        );
      return results.join("\n");
    })
    .catch((err) => err && Promise.reject(err));
};

/**
 * @description method to build css files
 * @param {string[]} inputs array of css files to build
 * @param {object} options
 * @param {boolean} options.verbose flag to print the version of the package (default: true)
 * @param {string} options.cwd current working directory (default: process.cwd())
 * @param {string} options.tokenPkg name of the package to get the tokens from (default: @spectrum-css/tokens)
 * @returns {Promise<void>}
 */
const buildCSS = async (
  inputs,
  coreTokenPackage,
  {
    verbose = true,
    cwd = process.cwd(),
    validate = true,
    // tokenPkg = '@spectrum-css/tokens',
  } = {}
) => {
  if (!inputs || inputs.length === 0)
    return Promise.reject("Must define which assets to build.");

  const isMigrated = coreTokenPackage.endsWith("-tokens");

  /* Read files in once, combine & process below */
  const contentPromises = await fg(inputs, {
    cwd,
    absolute: true,
    onlyFiles: true,
  })
    .then(async (filePaths) => {
      return filePaths.reduce((acc, filePath) => {
        acc[filePath] = {
          content: fsp.readFile(filePath, "utf8"),
          isTheme: isMigrated ? filePath.includes("/themes/") : false,
        };
        return acc;
      }, {});
    })
    .catch((err) => err && Promise.reject(err));

  /* Combine all inputs into one content object */
  const allCombined = combineResults(contentPromises, { cwd, verbose });

  /* Validate token usage */
  const reportResults =
    verbose && validate && isMigrated
      ? validateTokenUse(await allCombined, coreTokenPackage, {
          componentName: `@spectrum-css/${path.basename(cwd)}`,
          ignorePrefixes: ["--highcontrast", "--mod"],
          verbose,
        })
      : Promise.resolve();

  /* index file keeps all variables */
  const indexWritten = process(
    allCombined,
    {
      from: inputs[0],
      to: isMigrated ? "dist/index.css" : "dist/index-vars.css",
    },
    verbose
  );

  /* base file strips unused variables */
  const baseWritten = process(
    allCombined,
    {
      from: inputs[0],
      to: "dist/index-base.css",
      keepUnusedVars: false,
      splinatorOptions: {
        noFlatVariables: true,
      },
    },
    verbose
  );

  const themesWritten = Object.entries(contentPromises).map(
    ([filePath, { isTheme, content }]) => {
      /* Special case for express: it needs Spectrum base vars and needs to override them */
      if (!isTheme || path.basename(filePath, ".css") === "express") return;

      return process(
        content,
        {
          from: filePath,
          to: `dist/themes/${path.basename(filePath)}`,
          keepUnusedVars: true,
          splinatorOptions: {
            noSelectors: true,
          },
        },
        verbose
      );
    }
  );

  const coreKey = Object.entries(contentPromises).find(
    ([filePath, { isTheme }]) =>
      isTheme && path.basename(filePath, ".css") === "spectrum"
  )?.[0];
  if (!coreKey) return Promise.reject("Could not find core theme file.");

  /* Remove the core theme from the contentPromises so it doesn't get processed twice */
  const coreTheme = contentPromises[coreKey];
  delete contentPromises[coreKey];

  const combinedThemeContent = combineResults(
    {
      [coreKey]: coreTheme,
      ...contentPromises,
    },
    {
      filter: ([, { isTheme }]) => !!isTheme,
      cwd,
      verbose,
    }
  );

  return Promise.all([
    reportResults,
    indexWritten,
    baseWritten,
    ...themesWritten,
    /* Special case for express: it needs Spectrum base vars and needs to override them */
    expressWritten(combinedThemeContent),
  ]);
};

module.exports = async (config) => {
  const verbose = config.verbose ?? true;
  const cwd = config.cwd ?? process.cwd();

  const packagePath = path.join(cwd, "package.json");
  if (await fsp.access(packagePath).catch(() => true)) return;
  const pkg = await fsp
    .readFile(packagePath, "utf-8")
    .then(JSON.parse)
    .catch(console.error);

  let coreTokenPackage;
  const assets = [];
  const peerPkgNames = Object.keys(pkg.peerDependencies);
  if (peerPkgNames.includes("@spectrum-css/tokens")) {
    coreTokenPackage = "@spectrum-css/tokens";
    assets.push("index.css", "themes/*.css");
  } else if (peerPkgNames.includes("@spectrum-css/vars")) {
    coreTokenPackage = "@spectrum-css/vars";
    assets.push("index.css", "skin.css");
  }

  if (!coreTokenPackage)
    return console.log(`No core tokens found for ${pkg.name}`);

  if (verbose) console.log(chalk.yellow(pkg.name), `| building CSS assets`);

  await fsp.mkdir(path.join("dist/themes"), { recursive: true }).catch();
  // ["index.css", "skin.css"
  return buildCSS(assets, coreTokenPackage, { cwd, verbose, validate: true });
};
