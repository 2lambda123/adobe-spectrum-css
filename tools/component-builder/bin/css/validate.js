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

const postcss = require("postcss");
const { parse } = require("postcss-values-parser");

const chalk = require("chalk");

/**
 * @description get all the tokesn used in css files
 * @param {import("postcss").Root} root
 * @param {Map} componentTokens map of component tokens
 * @returns
 */
const getTokensUsedInCSS = (root, componentTokens, coreTokens) => {
  /**
   * @description get all the tokens used
   * @param {import("postcss").Node} node
   * @param {Set} usedTokens array of tokens used; used for recursion
   * @returns {Set} array of tokens used
   */
  const getTokensUsedInValueNode = (node, { usedTokens = new Set() } = {}) => {
    if (!node || !node.nodes) return usedTokens;

    for (const subNode of node.nodes) {
      const { type, value } = subNode;
      if (type === "word" && value.startsWith("--")) {
        usedTokens.add(value);
      } else if (type === "func") {
        getTokensUsedInValueNode(subNode, { usedTokens });
      }
    }

    return usedTokens;
  };

  if (!root) return;

  const usedTokens = new Set();
  const coreTokensUsed = new Map();
  const componentTokensUsed = new Map();

  root.walkRules((rule, _idx) => {
    rule.walkDecls((decl) => {
      const matches = decl.value.match(/var\(.*?\)/g);
      if (!matches) return;

      parse(decl.value)?.nodes.forEach((node) => {
        getTokensUsedInValueNode(node).forEach((tokenName) => {
          if (coreTokens.size > 0 && coreTokens.has(tokenName)) {
            coreTokensUsed.set(
              tokenName,
              (coreTokensUsed.get(tokenName) || 0) + 1
            );
          } else if (componentTokens.has(tokenName)) {
            componentTokensUsed.set(
              tokenName,
              (componentTokensUsed.get(tokenName) || 0) + 1
            );
          }

          usedTokens.add(tokenName);
        });
      });
    });
  });

  return { usedTokens, coreTokensUsed, componentTokensUsed };
};

/**
 * @description get all tokens defined in css files
 * @param {import("postcss").Root} root
 * @returns {Set} map of all the tokens
 */
const getTokensDefinedInCSS = (root) => {
  if (!root) return;

  const definedVariables = new Set();
  root.walkRules((rule, _idx) => {
    rule.walkDecls((decl) => {
      if (!decl.prop.startsWith("--")) return;
      definedVariables.add(decl.prop);
    });
  });

  return definedVariables;
};

/**
 * @description get all core tokens from spectrum-css/tokens
 * @param {string} tokenPackageName name of the package to get the tokens from (default: @spectrum-css/tokens)
 * @param {boolean} verbose flag to print the version of the package (default: true)
 * @returns {Set} map of all the tokens
 */
const getCoreTokens = (tokenPackageName, { verbose = true }) => {
  if (!tokenPackageName) return;

  const fetchOptions = {
    paths: [process.cwd(), path.join(process.cwd(), "../../")],
  };

  if (verbose) {
    const {
      version,
    } = require(`${tokenPackageName}/package.json`, fetchOptions);
    console.log(
      `  ${chalk.bold.gray("⟫")} using: ${tokenPackageName}@${chalk.bold(
        `${version}`
      )}`
    );
  }

  /* Resolve core tokens first from the current working directory, or if not found, from the root of the monorepo */
  const coreTokensFile = require.resolve(tokenPackageName, fetchOptions);
  const result = fs.readFileSync(coreTokensFile, "utf8");
  if (!result) return;

  const root = postcss.parse(result);
  return getTokensDefinedInCSS(root);
};

/**
 * @description validate the css files for correct usage
 * @param {string[]} globFile - files to check in glob format
 * @param {string} componentName - component name
 * @returns {Promise<void>}
 **/
module.exports = async (
  css,
  coreTokenPackage,
  { componentName, ignorePrefixes, verbose = true }
) => {
  if (!css) return;

  const coreTokens = getCoreTokens(coreTokenPackage, { verbose });

  // Parse the CSS into a format that we can analyze
  /** @type {import("postcss").Root} */
  const root = postcss.parse(css);
  // Get tokens defined inside of the component
  const componentTokens = getTokensDefinedInCSS(root);
  // Find all tokens used in the component
  const { usedTokens } = getTokensUsedInCSS(root, componentTokens, coreTokens);

  // Make sure the component doesn't use any undefined tokens
  const errors = [];
  for (const tokenName of usedTokens) {
    if (
      !coreTokens.has(tokenName) &&
      !componentTokens.has(tokenName) &&
      ignorePrefixes.every((prefix) => !tokenName.startsWith(prefix))
    ) {
      errors.push(
        `${chalk.yellow(componentName)} uses undefined token ${tokenName}.`
      );
    }
  }

  // Make sure all tokens defined in the component are used
  for (const tokenName of componentTokens.keys()) {
    if (!usedTokens.has(tokenName)) {
      errors.push(`Defines ${tokenName}, but never uses it.`);
    }
  }

  if (!errors.length) {
    if (verbose) {
      console.log(
        `  ${chalk.bold.gray("⟫")} using: ${chalk.bold(
          `${usedTokens.size}`
        )} tokens`
      );
    }
    return Promise.resolve();
  }

  if (verbose) {
    console.log(
      `  ${chalk.yellow(componentName)} | ${chalk.bold(
        `${errors.length}`
      )} errors:`
    );
    errors.forEach((error) => console.log(`    ${chalk.red("✖")} ${error}`));
  }

  Promise.reject(new Error(errors.join("\n")));
};
