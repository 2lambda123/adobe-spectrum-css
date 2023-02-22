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

const fsp = require("fs").promises;
const path = require("path");

const {
  getClassNames,
  getAllComponentVars,
  getAllVars,
  getVarsFromCSS,
  getVariableDeclarations
} = require("./lib/varUtils");

let verbose = process.argv.includes("--verbose") || process.argv.includes("-v") || false;

exports.bakeVars = async () => {
  const pkg = await fsp.readFile(path.join("package.json")).then(JSON.parse).catch(Promise.reject);
  const pkgName = pkg.name.split("/").pop();

  const fileContent = fsp.readFile("dist/index-vars.css", "utf-8").catch(Promise.reject);
  if(!fileContent) return;

  const classNames = getClassNames(fileContent, pkgName);

  // Get vars defined inside of the component
  // const componentVars = getVarsDefinedInCSS(fileContent);

  // Get vars in ALL components
  const vars = await getAllComponentVars();

  // Get literally all of the possible vars (even overridden vars that are different between themes/scales)
  const allVars = await getAllVars();

  const usedVars = {};
  // Find all custom properties used in the component
  for (const varName of getVarsFromCSS(fileContent)) {
    if (varName.indexOf("spectrum-global") !== -1 && verbose) {
      console.warn(`⚠️  ${pkg.name} directly uses global variable ${varName}`);
      continue;
    }

    if (
      !allVars[varName] &&
      !varName.startsWith("--mod") &&
      !varName.startsWith("--highcontrast") &&
      verbose
    ) {
      console.warn(`🔶 ${pkg.name} uses locally defined variable ${varName}`);
      continue;
    }

    usedVars[varName] = vars[varName];
  }

  return fsp.writeFile('dist/vars.css', getVariableDeclarations(classNames, usedVars));
};
