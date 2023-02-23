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

const fsp = require('fs').promises;

const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

const varDir = path.dirname(
    require.resolve('@spectrum-css/vars/package.json', {
        paths: [process.cwd(), path.join(process.cwd(), '../../')]
    })
);

function getVarValues(css) {
    const root = postcss.parse(css);
    const variables = {};

    root.walkRules((rule, _ruleIndex) => {
      rule.walkDecls((decl) => {
        variables[decl.prop] = decl.value;
      });
    });

    return variables;
}

async function readDNAVariables(file) {
  const css = await fsp.readFile(file, "utf-8");
  return getVarValues(css);
}

/**
 * @description get all components vars
 * @returns
 */
 async function getAllComponentVars() {
  let variableList;

  let contents = "";
  for (const file of await fg([
    `css/components/*.css`,
    `css/globals/*.css`,
    `custom.css`
  ], {
    cwd: varDir,
    absolute: true,
  })) {
    contents += await fsp.readFile(file, "utf-8");
  }

  variableList = getVarValues(contents);

  await fsp.writeFile("everything.css", contents);
  return variableList;
}

module.exports = postcss.plugin('postcss-custom-properties-mapping', function() {
  return async function (root, _result) {
    // Read in all static vars
    const staticVars = {
        ...await readDNAVariables(path.join(varDir, 'css/globals/spectrum-staticAliases.css')),
        ...await readDNAVariables(path.join(varDir, 'css/globals/spectrum-fontGlobals.css')),
        ...await readDNAVariables(path.join(varDir, 'css/globals/spectrum-fontGlobals.css')),
        ...await readDNAVariables(path.join(varDir, 'css/globals/spectrum-dimensionGlobals.css')),
        ...await readDNAVariables(path.join(varDir, 'css/globals/spectrum-colorGlobals.css')),
        ...await readDNAVariables(path.join(varDir, 'css/globals/spectrum-animationGlobals.css')),
    };

    // Read in all variables so we have the value they resolve to
    const allVars = await getAllComponentVars();

    root.walkRules((rule, _ruleIndex) => {
      rule.walkDecls((decl) => {
        // match custom property inclusions
        if (!/(^|[^\w-])var\([\W\w]+\)/.test(decl.value)) return;

        const value = valueParser(decl.value);

        if (value.nodes && value.nodes[0] && value.nodes[0].value === 'url') {
            // Don't process custom properties within URLs, it does nothing and breaks parcel
            // see https://github.com/parcel-bundler/parcel/issues/3881
            return;
        }

        value.walk((node, index, nodes) => {
        if (node.type === 'function' && node.value === 'var') {
            const v = node.nodes[0].value;

            // If the value is static, replace the variable with the value.
            // Otherwise, change the variable name to the mapped name.
            if (staticVars[v]) {
                nodes.splice(index, 1, ...valueParser(`var(${v}, ${staticVars[v]})`).nodes);
            } else if (allVars[v]) {
                nodes.splice(index, 1, ...valueParser(`var(${v}, ${allVars[v]})`).nodes);
            }
        }
        });

        decl.value = value.toString();
      });
    });
  }
});
