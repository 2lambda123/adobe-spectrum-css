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
const fsp = require('fs').promises;
const path = require('path');
const through = require('through2');

const del = require('del');

// Base variables we can just map directly
const flatVars = [
  'colorGlobals',
  'fontGlobals',
  'dimensionGlobals',
  'animationGlobals',
  'staticAliases'
];

const dropTokens = {
  'name': true,
  'description': true,
  'status:': true,
  'varBaseName': true
};

function getCSSVariableReference(value) {
  if (value[0] === '$') {
    value = value.substr(1);

    // Strip the stop information
    value = value.replace(/colorStopData\..*?\.colorTokens\./, 'global-color.');
    value = value.replace(/colorStopData\..*?\.colorAliases\./, 'alias.');
    value = value.replace(/colorStopData\..*?\.colorSemantics\./, 'semantic.');
    // Strip the scale information
    value = value.replace(/scaleData\..*?\.dimensionTokens\./, 'global-dimension.');
    value = value.replace(/scaleData\..*?\.dimensionAliases\./, 'alias.');
    // Sub in proper names for globals
    value = value.replace(/colorGlobals\./, 'global-color.');
    value = value.replace(/dimensionGlobals\./, 'global-dimension.static-');
    value = value.replace(/fontGlobals\./, 'global-font.');
    value = value.replace(/animationGlobals\./, 'global-animation.');
    value = value.replace(/staticAliases\./, 'alias.');

    return getCSSVarName(value.replace(/\./, '-')); // was: `--spectrum-${parts.join('-')}`;
  }
  return value;
}

function getCSSVarName(key, prefix = '') {
  if (prefix)
  key = prefix ? `${prefix}-${key}` : key;
  return `--spectrum-${key}`;
}

function getCSSVar(prefix, key, value) {
  key = getCSSVarName(prefix, key);
  if (value[0] === '$') {
    const reference = getCSSVariableReference(value);
    return `  ${key}: var(${reference});
`;
  }
  value = processValue(key, value);
  return `  ${key}: ${value};
`;
}

function initializeObject(array) {
  return array.reduce((a, v) => {
    a[v] = {}; return a;
  }, {});
}

function populateObject(parentObject, keysOfParent, keyOfChild) {
  const obj = {}
  for (const key of keysOfParent) {
    obj[key] = parentObject[key][keyOfChild];
  }
  return obj;
}

function processValue(name, value) {
  if (name.indexOf('animation') !== -1) {
    if (value[0] === '(') {
      return `cubic-bezier${value}`;
    } if (name.match(/delay$/) && value.indexOf('ms') === -1) {
      return `${value}ms`;
    }
    return value;
  }
  if (name.match(/opacity/) && typeof (value) === 'string' && value.substr(-1) === '%') {
    return parseInt(value, 10) / 100;
  }
  return value;
}

function isColorValue(key, value) {
  return (
    key.match(/opacity/) ||
    key.match(/-color(-|$)/) ||
    value.match(/rgba\(|rgb\(|transparent/) ||
    value.match(/\$color/)
  );
}

function calculateOverrides(objects, processValue) {
  const identical = {};
  const overrides = {};
  for (const objectName of Object.keys(objects)) {
    overrides[objectName] = {};
  }

  // Get all the keys from all the objects
  const keys = [];
  for (const object of Object.values(objects)) {
    for (const key in object) {
      if (keys.indexOf(key) === -1) {
        keys.push(key);
      }
    }
  }

  // Assume we have the same keys in each object
  for (const key of keys) {
    let isIdentical = true;
    let value;

    for (const [objectName, object] of Object.entries(objects)) {
      value = object[key];

      if (dropTokens[key]) {
        overrides[objectName][key] = value;
        identical[key] = value;
        continue;
      }

      const compareValue = processValue(object[key]);

      // Check if the value is the same the same in all other objects
      for (const [otherObjectName, otherObject] of Object.entries(objects)) {
        const otherValue = otherObject[key];
        const otherCompareValue = processValue(otherObject[key]);

        if (!isIdentical || compareValue !== otherCompareValue) {
          isIdentical = false;
          overrides[otherObjectName][key] = otherValue;
          overrides[objectName][key] = value;
        }
      }
    }

    if (isIdentical) {
      identical[key] = value;
    }
  }

  return [identical, overrides];
}

function generateIndex(source, dest) {
  return function generateIndexInner() {
    let lastFile;
    const componentFilenames = [];
    return fs.createReadStream(source)
      .pipe(through.obj(
        (file, enc, cb) => {
          lastFile = file;
          componentFilenames.push(path.basename(file.path));
          cb(null);
        },
        function (cb) {
          const vinylFile = lastFile.clone({
            contents: false
          });
          vinylFile.path = path.join(lastFile.base, 'index.css');
          vinylFile.contents = Buffer.from(componentFilenames.map((fileName) => `@import '${fileName}';`).join('\n'));
          this.push(vinylFile);
          cb();
        }
      ))
      .pipe(fs.createWriteStream(dest));
  }
}

const generateComponentIndex = generateIndex('css/components/*.css', 'css/components/');
const generateGlobalsIndex = generateIndex('css/globals/*.css', 'css/globals/');


async function generateDNAFiles() {
  const pushFile = (contents, fileName, folder) => {
    const vinylFile = file.clone({
      contents: false
    });
    vinylFile.path = path.join(file.base, folder || '', fileName);
    vinylFile.contents = Buffer.from(contents);
    this.push(vinylFile);
  };

  const generateCSSFile = (sections, fileName, folder) => {
    let contents = `:root {
`;

    sections.forEach((section) => {
      const prefix = section.varBaseName;
      for (const key in section) {
        if (dropTokens[key]) {
          continue;
        }

        const value = section[key];
        if (value[0] === '[' && value[value.length - 1] === ']') {
          console.error(`Skipping ${prefix}-${key}, value is an array`);
          continue;
        }

        if (value.startsWith('rgb(')) {
          // Make -rgb variables for everything that's an actual rgb()
          contents += getCSSVar(prefix, `${key}-rgb`, value.replace(/^rgb\((.*?)\)/, '$1'));
          contents += getCSSVar(prefix, key, `rgb(var(${getCSSVarName(prefix, key)}-rgb))`);
        } else {
          contents += getCSSVar(prefix, key, value);
        }
      }
    });

    contents += `}
`;

    pushFile(contents, `spectrum-${fileName}.css`, folder);
  };

  const generateFiles = (sections, fileName, folder = '') => {
    generateCSSFile(sections, fileName, `css/${folder}`);
  };

  const varsPath = require.resolve('@adobe/spectrum-tokens-deprecated/package.json');
  const dnaJSONPath = path.join(path.dirname(varsPath), 'dist/data/json/dna-linked.json');
  const data = fsp.readFile(dnaJSONPath, 'utf8').then(JSON.parse).catch(() => {
    Promise.reject(new Error(`Unable to read DNA JSON file: ${dnaJSONPath}`));
  });

  const dnaData = data.dna;
  const metadata = {
    'dna-version': dnaData.version
  };

  // Get the list of stops and scales
  const stops = Object.keys(dnaData.colorStopData).filter((stopName) => dnaData.colorStopData[stopName].colorTokens.status !== 'Deprecated');
  const scales = Object.keys(dnaData.scaleData);
  const components = Object.keys(dnaData.components[stops[0]][scales[0]]).filter((componentName) =>
    // Ok this is gross, but we have to skip this bad boy because it duplicates tokens from selectlist!
    componentName !== 'select'
  );

  // Anything that doesn't consistently reference the same variable or value between stops/scales
  const componentColorOverrides = initializeObject(stops);
  const componentDimensionOverrides = initializeObject(scales);

  // Globals
  flatVars.forEach((key) => {
    // generateJSFile([dnaData[key]], key, 'js/globals');
    generateCSSFile([dnaData[key]], key, 'css/globals');
  });

  // Elements
  const jsElementVariables = initializeObject(components);
  const componentVariables = initializeObject(components);
  const colorVariables = {};
  const dimensionVariables = {};
  const cssFilesGenerated = {};
  const overriddenTokens = {};

  function addColorVariable(componentName, varName, value, varBaseName, stopName, stateName) {
    // Strip invalid # from placeholder variables
    varName = varName.replace('#', '_');

    if (stateName && stateName !== 'default') {
      varName += `-${stateName}`;
    }

    const fullName = `${varBaseName}-${varName}`;
    const cssVariableName = getCSSVariableReference(value);
    if (colorVariables[fullName] && colorVariables[fullName].cssVariableName !== cssVariableName) {
      // logger.debug(`Found override for ${fullName} (${colorVariables[fullName].cssVariableName} vs ${cssVariableName})`);
      componentColorOverrides[colorVariables[fullName].name][fullName] = colorVariables[fullName].value;
      componentColorOverrides[stopName][fullName] = value;
      overriddenTokens[fullName] = true;
      delete componentVariables[componentName][fullName];
    } else if (!overriddenTokens[fullName]) {
      componentVariables[componentName][fullName] = value;
    }
    colorVariables[fullName] = {
      name: stopName,
      value: value,
      cssVariableName: cssVariableName
    };
    jsElementVariables[componentName][varName] = value;
  }

  function addDimensionVariable(componentName, varName, value, varBaseName, scaleName, stateName) {
    // Strip invalid # from placeholder variables
    varName = varName.replace('#', '_');

    if (stateName && stateName !== 'default') {
      varName += `-${stateName}`;
    }

    const fullName = `${varBaseName}-${varName}`;
    const cssVariableName = getCSSVariableReference(value);
    if (dimensionVariables[fullName] && dimensionVariables[fullName].cssVariableName !== cssVariableName) {
      // logger.debug(`Found override for ${fullName} (${dimensionVariables[fullName].cssVariableName} vs ${cssVariableName})`);
      componentDimensionOverrides[dimensionVariables[fullName].name][fullName] = dimensionVariables[fullName].value;
      componentDimensionOverrides[scaleName][fullName] = value;
      overriddenTokens[fullName] = true;
      delete componentVariables[componentName][fullName];
    } else if (!overriddenTokens[fullName]) {
      componentVariables[componentName][fullName] = value;
    }
    dimensionVariables[fullName] = {
      name: scaleName,
      value: value,
      cssVariableName: cssVariableName
    };
    jsElementVariables[componentName][varName] = value;
  }

  for (const stopName of stops) {
    const stop = dnaData.components[stopName];

    for (const scaleName of scales) {
      const scale = stop[scaleName];

      for (const componentName of components) {
        const component = scale[componentName];

        for (const variantName in component) {
          const variant = component[variantName];

          const metadataKeyBase = `spectrum-${componentName}${variantName === 'default' ? '' : `-${variantName}`}`;
          metadata[`${metadataKeyBase}-name`] = variant.name;
          metadata[`${metadataKeyBase}-description`] = variant.description;
          metadata[`${metadataKeyBase}-status`] = variant.status;
          metadata[`${metadataKeyBase}-version`] = variant.version;

          if (variant.states) {
            for (const stateName in variant.states) {
              const state = variant.states[stateName];
              if (stateName === 'text-color') {
console.log({
                variant
              })
}
              for (const key in state) {
                const value = state[key];
                const varName = key;
                if (isColorValue(varName, value)) {
                  addColorVariable(componentName, varName, value, variant.varBaseName, stopName, stateName);
                } else {
                  addDimensionVariable(componentName, varName, value, variant.varBaseName, scaleName, stateName);
                }
              }
            }
          }

          if (variant.colors) {
            for (const key in variant.colors) {
              const value = variant.colors[key];
              const varName = key;
              addColorVariable(componentName, varName, value, variant.varBaseName, stopName);
            }
          }

          if (variant.dimensions) {
            for (const key in variant.dimensions) {
              const value = variant.dimensions[key];
              const varName = key;
              addDimensionVariable(componentName, varName, value, variant.varBaseName, scaleName);
            }
          }

          if (variant.animation) {
            for (const key in variant.animation) {
              const value = variant.animation[key];
              const varName = key;
              addDimensionVariable(componentName, varName, value, variant.varBaseName, scaleName);
            }
          }
        }
      }
    }
  }

  for (const componentName of components) {
    generateCSSFile([
      componentVariables[componentName]
    ], componentName, 'css/components');
    cssFilesGenerated[componentName] = true;

  // generateJSFile([
  //   jsElementVariables[componentName]
  // ], componentName, 'js/components');
  // generateJSIndexFile(dnaModules, 'js/');
  }

  pushFile(JSON.stringify(metadata, null, 2), 'spectrum-metadata.json', 'json/');

  // Determine alias overrides
  const [colorAliases,] = calculateOverrides(populateObject(dnaData.colorStopData, stops, 'colorAliases'), getCSSVariableReference);

  // Remove aliases with the same values from colorstops
  for (const aliasName in colorAliases) {
    if (dropTokens[aliasName]) {
      continue;
    }
    for (const stopName in dnaData.colorStopData) {
      const stop = dnaData.colorStopData[stopName];
      delete stop.colorAliases[aliasName];
    }
  }

  // Write out common aliases
  generateCSSFile([
    colorAliases
  ], 'colorAliases', 'css/globals/');

  // Determine semantic overrides
  const [colorSemantics, colorSemanticsOverrides] = calculateOverrides(populateObject(dnaData.colorStopData, stops, 'colorSemantics'), getCSSVariableReference);

  // Remove semantics with the same values from colorstops
  for (const semanticName in colorSemantics) {
    if (dropTokens[semanticName]) {
      continue;
    }
    for (const stopName in dnaData.colorStopData) {
      const stop = dnaData.colorStopData[stopName];
      delete stop.colorSemantics[semanticName];
    }
  }

  generateCSSFile([
    colorSemantics
  ], 'colorSemantics', 'css/globals/');

  // Write out stops
  for (const stopName in dnaData.colorStopData) {
    const stop = dnaData.colorStopData[stopName];
    if (stop.colorTokens.status === 'Deprecated') {
      continue;
    }

    generateFiles([
      stop.colorTokens,
      stop.colorAliases,
      stop.colorSemantics,
      componentColorOverrides[stopName]
    ], stopName, 'themes');
  }

  // Determine dimension alias overrides
  const [dimensionAliases,] = calculateOverrides(populateObject(dnaData.scaleData, scales, 'dimensionAliases'), getCSSVariableReference);

  // Remove aliases with the same values from scales
  for (const aliasName in dimensionAliases) {
    if (dropTokens[aliasName]) {
      continue;
    }
    for (const scaleName in dnaData.scaleData) {
      const scale = dnaData.scaleData[scaleName];
      delete scale.dimensionAliases[aliasName];
    }
  }

  generateCSSFile([
    dimensionAliases
  ], 'dimensionAliases', 'css/globals/');

  // Scales
  for (const scaleName in dnaData.scaleData) {
    const scale = dnaData.scaleData[scaleName];

    generateFiles([
      scale.dimensionTokens,
      scale.dimensionAliases,
      componentDimensionOverrides[scaleName]
    ], scaleName, 'scales');
  }

  cb();
}

exports.updateDNA = async () => {
  await del(['css/*', 'js/*']);
  await generateDNAFiles();
  await Promise.all([
    generateComponentIndex(),
    generateGlobalsIndex()
  ]);
}
