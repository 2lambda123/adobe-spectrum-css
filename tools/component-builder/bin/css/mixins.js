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

/**
 *  Helper: get a Spectrum CSS T-shirt class name
 *
 * @param {string} name DNA token name
 * @returns {string} Spectrum CSS t-shirt sized token name
 */
function getTShirtTokenName(name) {
  tokenName = name
    .replace(/-{1,2}(size)([A-Z]*)/, (match, p1, p2) => `--${p2}`)
    .replace(/\.?([A-Z]{,1}$ |[0-9])/g, (match, p1) => `-${p1}`)
    .replace(/([A-Z]{1,})/g, (match, p1) => `-${p1}`)
    .replace(/^-/, "");
  tokenName = tokenName.replace(".spectrum--", "").replace("--", "");
  tokenName = tokenName.toLowerCase();
  return tokenName;
}

/**
 * Helper: get typography sizes
 * Shared with t-shirt and numeric sizes
 *
 * @param {string} name class name
 * @param {string} tokenName token name
 * @param {string} textTransformIgnore ignore text transforms
 * @param {string} [addStrongAndEmphasizedChildren=false] add legacy support for strong, em children
 * @param {boolean} [showIndicatorBorder=false] shows a blue border around the items. Useful for debugging.
 * @returns {string} CSS output
 */
function getTypographySizes(
  name,
  tokenName,
  textTransformIgnore,
  addStrongAndEmphasizedChildren = false,
  showIndicatorBorder = false
) {
  var output = "";
  var propMap = {
    "font-size": "text-size",
    "font-weight": "text-font-weight",
    "line-height": "text-line-height",
    "font-style": "text-font-style",
    "letter-spacing": "text-letter-spacing",
    "text-transform": "text-transform",
  };

  /**
   *  Build typography properties for a DNA token
   *
   * @param {string} tokenString name of the token
   * @returns {string} CSS rule for provided selector selector
   */
  function buildProperties(tokenString) {
    var ruleString = "";
    Object.keys(propMap).forEach((key) => {
      if (!textTransformIgnore || key != "text-transform") {
        ruleString += `  ${key}: var(--spectrum-${tokenString}-${propMap[key]});\n`;
      }
    });
    ruleString += "  margin-block-start: 0;\n  margin-block-end: 0;\n";
    return ruleString.toLowerCase();
  }

  var indicatorBorder =
    showIndicatorBorder === true ? "border: solid 1px blue;" : "";

  // Add classnames as an alternative for <strong> and <em> for typography items with a classname.
  // -emphasized & -strong will be added to the last provided classname or to provided ID.
  // Example classname:  "em, .spectrum-Heading2--quiet-emphasized"
  emStrongClassName =
    name.indexOf(".") !== -1 ? "." + name.split(".").pop() : name;

  // Fallback to add <em> and <strong> overwrites if addStrongAndEmphasizedChildren is set to true.
  // This is only used for the pre-t-shirt sized typography.
  var strongAndEmphasizedChildren =
    addStrongAndEmphasizedChildren === true
      ? `
      em {
        ${buildProperties(`${tokenName}-emphasized`)}
      }
      strong {
        ${buildProperties(`${tokenName}-strong`)}
      }
    `
      : "";

  output = `${name} {
    ${indicatorBorder}

    ${buildProperties(tokenName)}
      ${strongAndEmphasizedChildren}
    }`;
  return output;
}

/**
 * Helper: get typography margins
 * Shared with t-shirt and numeric sizes
 *
 * @param {*} name class name
 * @param {*} tokenName token name
 * @returns {string} CSS output
 */
function getTypographyMargins(name, tokenName) {
  var output = `${name} {
      margin-block-start: var(--spectrum-${tokenName}-margin-top);
      margin-block-end: var(--spectrum-${tokenName}-margin-bottom);
    }`;
  return output;
}

/**
 * Helper: get typography colors
 *
 * @param {*} name class name
 * @param {*} tokenName token name
 * @param {boolean} [showIndicatorBackground=false]
 * @returns {string} CSS output
 */
function getTypographyColor(name, tokenName, showIndicatorBackground = false) {
  var indicatorBackground =
    showIndicatorBackground === true ? "background-color: orange;" : "";
  var output = `${name} {
      ${indicatorBackground}
      color: var(--spectrum-${tokenName.toLowerCase()}-text-color);
    }`;
  return output;
}

/**
 * Add CSS nodes that are going to be processed with postcss
 *
 * @param {string} mixin name of the mixin
 * @param {string} css css injected in the mixin
 */
function addNodesToCSS(mixin, css) {
  var nodes = postcssReal.parse(css);
  nodes.nodes[0].append(mixin.nodes);
  mixin.replaceWith(nodes);
}

/**
 * Generate typography t-shirt sizes
 *
 * @param {*} mixin mixin name
 * @param {*} name class name
 * @param {*} tokenName name of token
 * @param {*} textTransformIgnore  ignore text transform
 */
exports.typographyTShirtSizes = function (
  mixin,
  name,
  tokenName,
  textTransformIgnore
) {
  if (!tokenName) {
    var tokenName = getTShirtTokenName(name);
  }

  // overwrite-support for the Typography-V3 <em> & <strong> selectors
  // sharing the same classname ".spectrum-Detail". This will be added like
  // ".spectrum-Detail--sizeXL em {}"
  addStrongAndEmphasizedChildren = name.includes(".spectrum-Detail")
    ? true
    : false;

  var output = getTypographySizes(
    name,
    tokenName,
    textTransformIgnore,
    addStrongAndEmphasizedChildren,
    (showIndicatorBorder = false)
  );
  addNodesToCSS(mixin, output);
};

/**
 * generate typography numeric sizes
 * @param {*} mixin mixin name
 * @param {*} name class name
 * @param {*} tokenName name of token
 * @param {*} textTransformIgnore  ignore text transform
 */
exports.typography = function (mixin, name, tokenName, textTransformIgnore) {
  if (!tokenName) {
    tokenName = name
      .replace(/\.?([A-Z]|[0-9])/g, function (x, y) {
        return "-" + y.toLowerCase();
      })
      .replace(/^-/, "");
    tokenName = tokenName.replace(".spectrum--", "");
  }

  var output = getTypographySizes(
    name,
    tokenName,
    textTransformIgnore,
    (addStrongAndEmphasizedChildren = false),
    (showIndicatorBorder = false)
  );
  addNodesToCSS(mixin, output);
};

/**
 * Generate typography margins for t-shirt sizes
 *
 * @param {*} mixin mixin name
 * @param {*} name class name
 * @param {*} tokenName name of token
 */
(exports.typographyTShirtMargins = function (mixin, name, tokenName) {
  if (!tokenName) {
    var tokenName = getTShirtTokenName(name);
  }
  var output = getTypographyMargins(name, tokenName);
  addNodesToCSS(mixin, output);
}),
  /**
   * Generate typography margins for numeric sizes
   *
   * @param {*} mixin mixin name
   * @param {*} name class name
   * @param {*} tokenName name of token
   */
  (exports.typographyMargins = function (mixin, name, tokenName) {
    if (!tokenName) {
      tokenName = name
        .replace(/\.?([A-Z]|[0-9])/g, function (x, y) {
          return "-" + y.toLowerCase();
        })
        .replace(/^-/, "");
      tokenName = tokenName.replace(".spectrum--", "");
    }
    var output = getTypographyMargins(name, tokenName);
    addNodesToCSS(mixin, output);
  });

/**
 * generate typography colors for t-shirt sizes
 *
 * @param {*} mixin mixin name
 * @param {*} name class name
 * @param {*} tokenName name of token
 */
exports.typographyTShirtColor = function (mixin, name, tokenName) {
  if (!tokenName) {
    var tokenName = getTShirtTokenName(name);
  }
  var output = getTypographyColor(
    name,
    tokenName,
    (showIndicatorBackground = false)
  );
  addNodesToCSS(mixin, output);
};

/**
 * generate typography colors for numeric sizes
 *
 * @param {*} mixin mixin name
 * @param {*} name class name
 * @param {*} tokenName name of token
 */
exports.typographyColor = function (mixin, name, tokenName) {
  if (!tokenName) {
    tokenName = name
      .replace(/\.?([A-Z]|[0-9])/g, function (x, y) {
        return "-" + y.toLowerCase();
      })
      .replace(/^-/, "");
    tokenName = tokenName.replace(".spectrum--", "");
  }
  var output = getTypographyColor(name, tokenName, false);
  addNodesToCSS(mixin, output);
};
