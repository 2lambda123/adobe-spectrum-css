/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const gulp = require('gulp');
const postcss = require('postcss');
const concat = require('gulp-concat');
const through = require('through2');
const fsp = require('fs').promises;
// const logger = require('gulplog');
const path = require('path');

function getVarsFromCSS(css) {
  const variableList = [];
  const root = postcss.parse(css);

  root.walkRules((rule, ruleIndex) => {
    rule.walkDecls((decl) => {
      const matches = decl.value.match(/var\(.*?\)/g);
      if (matches) {
        matches.forEach((match) => {
          const varName = match.replace(/var\((--[\w\-]+),?.*?\)/, '$1').trim();
          if (variableList.indexOf(varName) === -1) {
            variableList.push(varName);
          }
        });
      }
    });
  });
  return variableList;
}

function getVarsDefinedInCSS(css) {
  const variableList = [];
  const root = postcss.parse(css);

  root.walkRules((rule, ruleIndex) => {
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        const varName = decl.prop;
        if (variableList.indexOf(varName) === -1) {
          variableList.push(varName);
        }
      }
    });
  });
  return variableList;
}

function getVarValues(css) {
  const root = postcss.parse(css);
  const variables = {};

  root.walkRules((rule, ruleIndex) => {
    rule.walkDecls((decl) => {
      variables[decl.prop] = decl.value;
    });
  });

  return variables;
}

function getClassNames(contents, pkgName) {
  const root = postcss.parse(contents);
  const classNames = [];

  function addClassname(className) {
    if (classNames.indexOf(className) === -1) {
      classNames.push(className);
    }
  }

  const result = root.walkRules((rule, ruleIndex) => {
    const selector = rule.selectors[0];

    if (pkgName === 'page') {
      className = '';
      return 'false';
    }

    rule.selectors.forEach((fullSelector) => {
      // Skip compound selectors, they may not start with the component itself
      if (fullSelector.match(/~|\+/)) {
        return true;
      }

      const selector = fullSelector.split(' ').shift();

      if (rule.type === 'rule') {
        const matches = selector.match(/^\.spectrum-[\w]+/);
        if (matches) {
          const modSelector = matches[0]
          addClassname(modSelector);
        }
      }
    });
  });

  if (classNames.length === 0) {
    //.error(`Could not find classNames for ${pkgName}, assuming no classNames`);
    classNames.push('');
  }

  //logger.debug(`Found classNames ${classNames.join(', ')} for ${pkgName}`);

  return classNames;
}

function resolveValue(value, vars) {
  if (value) {
    const match = value.match(/var\((.+),?.*?\)/);
    if (match) {
      return match[1];
    }
    return value;
  }
}

const varDir = path.join(path.dirname(require.resolve('@spectrum-css/vars')), '..');
const coreTokensFile = require.resolve('@spectrum-css/tokens');

async function readDNAVariables(file) {
  const css = await fsp.readFile(path.join(varDir, 'css', file));
  const vars = getVarValues(css);
  return vars;
}

function getVariableDeclarations(classNames, vars) {
  const varNames = Object.keys(vars);
  if (varNames.length) {
    return `
${classNames.map((className) => `${className}`).join(',\n')} {
${varNames.map((varName) => `  ${varName}: ${vars[varName]};`).join('\n')}
}
`;
  }

  return '';
}

function getAllVars() {
  return new Promise((resolve, reject) => {
    let variableList;

    gulp.src([
      `${varDir}/css/themes/*.css`,
      `${varDir}/css/scales/*.css`,
      `${varDir}/css/components/*.css`,
      `${varDir}/css/globals/*.css`,
      `${varDir}/custom.css`,
      coreTokensFile
    ])
      .pipe(concat('everything.css'))
      .pipe(through.obj((file, enc, cb) => {
        variableList = getVarValues(file.contents.toString());

        cb(null, file);
      }))
      .on('finish', () => {
        resolve(variableList);
      })
      .on('error', reject);
  });
}

function getAllComponentVars() {
  return new Promise((resolve, reject) => {
    let variableList;

    gulp.src([
      `${varDir}/css/components/*.css`,
      `${varDir}/css/globals/*.css`,
      `${varDir}/custom.css`
    ])
      .pipe(concat('everything.css'))
      .pipe(through.obj((file, enc, cb) => {
        variableList = getVarValues(file.contents.toString());

        cb(null, file);
      }))
      .on('finish', () => {
        resolve(variableList);
      })
      .on('error', reject);
  });
}

exports.getAllComponentVars = getAllComponentVars;
exports.getAllVars = getAllVars;
exports.getVarsDefinedInCSS = getVarsDefinedInCSS;
exports.getVarsFromCSS = getVarsFromCSS;
exports.getVarValues = getVarValues;
exports.getClassNames = getClassNames;
exports.resolveValue = resolveValue;
exports.readDNAVariables = readDNAVariables;
exports.getVariableDeclarations = getVariableDeclarations;
