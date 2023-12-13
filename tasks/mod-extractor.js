/*!
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable no-console */

const { existsSync, readdirSync, mkdirSync, readFileSync } = require("fs");
const { writeFile } = require("fs").promises;
const { join, sep, dirname } = require("path");

const fg = require("fast-glob");
const prettier = require("prettier");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

require("colors");

/**
 * A global object to store the pathing information for the script
 */
const pathing = {
  root: join(__dirname, ".."),
  components: join(__dirname, "..", "components"),
};

/**
 * A global list of all the packages available to compare
 */
const allPackages = [
  ...(readdirSync(pathing.components, { withFileTypes: true })
    ?.filter((file) => file.isDirectory())
    .map((file) => file.name) ?? []),
  "ui-icons",
  "tokens",
];

/**
 * A global object for console logging different types of messages
 * in a consistent way
 */
const log = {
  error: (err) => console.trace(`${err}\n\n`),
  write: (msg) => process.stdout.write(msg),
};

/**
 * This regex will find all the custom properties that start with --mod-
 * and are defined inside a var() function. The last capture group will
 * ignore any mod properties that are followed by a colon, to exclude
 * sub-component passthrough properties that should not be listed as mods.
 *
 * @param {string|import("fs").PathLike} filepath
 * @param {Map<string, RegExp[]>} bucketConfig
 * @return {Promise<Map<string, Set<string>>>}
 */
async function extractProperties(filepath, bucketConfig = new Map()) {
  if (!filepath) return Promise.reject("No filepath provided");
  if (bucketConfig.size === 0) return Promise.reject("No bucketConfig provided");

  /* Remove duplicates using a Set and sort the results (default is alphabetical) */
  return [...bucketConfig.entries()].reduce((data, [key, regexes]) => {
      console.log({ data, key, regexes });
    if (!regexes || regexes.length === 0) return;

    /* Read the file and find all the matches */
    const content = readFileSync(filepath, { encoding: "utf-8" });

    if (!content || content === "") return;

    const found = data.get(key) ?? new Set();

    // assign the matches to an array through the spread operator and map the results to the first capture group
    regexes.forEach((regex) => {
      console.log({ regex });
      const matches = [...content.matchAll(regex)];
      console.log(matches);
      if (!matches) return;
      matches.forEach((match) => {
        if (!match[1]) return;
        found.add(match[1]);
      });
    });

    data.set(key, found);

    return data;
  }, new Map());
}

/* -- Markdown Output -- */
/* Output as a markdown table in the metadata folder for site rendering */
async function writeTable(destination, filename, data, title = "Custom properties") {
  // If the metadata folder doesn't exist, create it
  if (!existsSync(destination)) mkdirSync(destination);

  const formattedResults = [
    `| ${title} |\n| --- |`,
    ...[...data].sort().map((result) => `| \`${result}\` |`),
  ];

  const finalResult = prettier.format(formattedResults.join("\n"), {
    parser: "markdown",
  });

  // Write the results to a markdown file in the metadata folder
  return writeFile(join(destination, filename), finalResult, (err) => {
    if (err) throw err;
  });
}

/* -- Markdown Output -- */
/* Output as a markdown table in the metadata folder for site rendering */
async function writeData(destination, filename, data) {
  // If the metadata folder doesn't exist, create it
  if (!existsSync(destination)) mkdirSync(destination);

  const finalResult = prettier.format(JSON.stringify(data, null, 2), {
    parser: "json",
  });

  // Write the results to a markdown file in the metadata folder
  return writeFile(join(destination, filename), finalResult, (err) => {
    if (err) throw err;
  });
}

async function processPackage(packageName) {
  const dir = dirname(
    require.resolve(`@spectrum-css/${packageName}/package.json`) ?? join(pathing.root, packageName, "package.json") ?? join(pathing.components, packageName, "package.json")
  );

  const tokens = new Map();

  const files = await fg("*.css", {
    cwd: join(dir, "dist"),
    absolute: true,
    /* Skip the vars and tokens files */
    ignore: [
      "**/node_modules/**",
      "**/metadata/**",
      "**/express.css",
      "**/spectrum.css",
      "**/index-theme.css",
    ],
    onlyFiles: true,
  });

  const bucketConfig = new Map([
    ["mods", [/--mod-(a-z+|-?)+/g]],
    ["internal", [new RegExp(`--spectrum-${packageName}-(a-z+|-?)+`, "g")]],
    ["globals", [new RegExp(`--spectrum-(?!${packageName})-(a-z+|-?)+`, "g")]],
    ["a11y", [/--highcontrast-(a-z+|-?)+/g]],
  ]);

  /* Loop over the directories in the components folder and find all the first-level css files */
  for (const filepath of files) {
    console.log({ filepath });
    const foundTokens = await extractProperties(filepath, bucketConfig);
    Object.entries(foundTokens).forEach(([found, key]) => {
      if (!tokens.has(key)) tokens[key] = new Set();
      tokens[key] = new Set([...tokens[key], ...found].sort());
    });
  }

  console.log({ tokens });

  const hasMods = tokens && tokens.mods && tokens.mods.size > 0;

  if (!hasMods) {
    log.write(`\n${"⚠️".yellow}  No modifiable custom properties in ${
      `@spectrum-css/${dir.split(sep).pop()}`.magenta
    }`);
    return Promise.resolve();
  }

  if (tokens.mods) {
    /* -- Markdown Output -- */
    await writeTable(join(dir, "metadata"), "mods.md", tokens.mods, "Modifiable custom properties");
  }

  /* -- JSON Output -- */
  await writeData(join(dir, "dist"), "metadata.json", tokens);
}

/**
 * @description This is the entry point for the task; it will process the
 *  packages specified and generate a markdown and json file for each package
 *  that contains the custom properties leveraged by the package.
 *
 * @param {string[]} inputs
 * @returns {Promise<void>}
 */
async function main(inputs) {
  /* If no packages are defined, run the compare script against all available packages */
  if (!inputs || inputs.length === 0) {
    inputs = allPackages;
  }

  /* Loop over the directories passed in as arguments */
  return Promise.all(inputs.map(packageName => processPackage(packageName)));
}

const { _ = [] } = yargs(hideBin(process.argv)).argv;

main(_).catch((err) => {
  if (err) log.error(err);
  process.exit(1);
});

/* eslint-enable no-console */
