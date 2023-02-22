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
const fs = require("fs")
const path = require('path');

const del = require("del")
const fg = require("fast-glob")
const { promisify } = require('util');
const svgcombiner = require('svgcombiner');

const rename = require('stream-rename');
const { optimize } = require('svgo');
const replace = require('replace-in-file');
const sort = require('sort-stream');
const svgstore = require('svgstore');

const tasks = require('@spectrum-css/component-builder');

async function clean() {
  return del([
    'combined/**'
  ]);
}

/**
 * @description This code will read all the files in the medium and large directories,
 * transform the data in the files using the replace and svgmin functions,
 * rename the files, and write the modified versions to the current directory.
 */
 const minifySvg = async (filePath) => {
  const fileContents = await promisify(fs.readFile)(filePath, 'utf8');
  // Remove <defs> and <rect> elements from SVG
  const sanitizedSvg = fileContents
    .replace(/<defs>[\s\S]*?<\/defs>/m, '')
    .replace(/<rect[\s\S]*?\/>/m, '');

  // Minify SVG
  const { optimize } = require('svgo');
  const optimizedSvg = optimize(sanitizedSvg, {
    plugins: [
      {
        name: 'removeAttrs',
        params: {
          attrs: [
            'class',
            'data-name',
            'id'
          ]
        }
      },
      {
        name: 'collapseGroups'
      }
    ]
  }).data;

  // Get the filename without the directory or extension
  const { name, dir } = path.parse(filePath);
  const iconName = name.split('_').pop().replace('Size', '');

  // Write optimized SVG to new file
  const outputPath = path.join(__dirname, `${dir}/${iconName}.svg`);
   // Delete the original file
  await promisify(fs.unlink)(filePath);
  await promisify(fs.writeFile)(outputPath, optimizedSvg);

  // Delete the original file
  // await promisify(fs.unlink)(filePath);
};

const sanitizeIcons = async () => {
  // Find all SVG files in the "medium" and "large" directories
  const icons = await fg(['medium/*.svg', 'large/*.svg']);
  // Minify and rename each SVG file
  await Promise.all(icons.map(minifySvg));
};

/**
 * @description This code will read all the files in the medium and large directories,
 * transform the data in the files using the replace and svgmin functions,
 * rename the files, and write the modified versions to the current directory.
 */
async function sanitizeIcons() {
  for (const file of await fg('{medium,large}/*.svg')) {
    fs.createReadStream(file)
      .pipe(replace(/<defs>[\s\S]*?<\/defs>/m, ''))
      .pipe(replace(/<rect[\s\S]*?\/>/m, ''))
      .pipe(optimize({
        plugins: [
          {
            name: 'removeAttrs',
            params: {
              attrs: [
                'class',
                'data-name',
                'id'
              ]
            }
          },
          {
            name: 'collapseGroups'
          }
        ]
      }))
      .pipe(rename((path) => path.basename = path.basename.split('_').pop().replace('Size', '')))
      .pipe(fs.createWriteStream(file.replace('{medium,large}/', './')))
      .on('finish', () => {
        del(file); // delete the original file
      });
  }
}

/**
 * @description This code will read all the files in the medium and large directories, transform the data in the files using the sort and svgcombiner functions,
 * and write the modified versions to the
 */
 async function generateCombinedIcons() {
  const files = await fg(['medium/*.svg', 'large/*.svg']);
  // Sort files alphabetically
  files.sort();
  const grouped = {};
  const promises = [];
  for (const filePath of files) {
    const cleanedName = path.basename(filePath, path.extname(filePath)).replace(/S_UI(.*?)_.*/, '$1');
    const directory = 'spectrum-UIIcon--' + path.dirname(filePath).split(path.sep).pop();
    grouped[cleanedName] = grouped[cleanedName] || [];
    grouped[cleanedName].push({ directory: directory, file:filePath });
  }

  // Combine SVGs
  for (const filePath of Object.keys(grouped)) {
    const svgGroup = grouped[filePath].reduce((acc, cur) => ({
      ...acc,
      [cur.directory]: fs.readFileSync(cur.file , 'utf8')
    }), {});
    const combinedSvg = svgcombiner( filePath , svgGroup);

    // Write combined SVG to file
    promises.push(
      fsp.writeFile(`combined/${filePath}.svg`, combinedSvg)
    );
  }

  return Promise.all(promises);
}

// Only run by Adobe
const updateIcons =  async () => {
  await clean();
  sanitizeIcons();
  generateCombinedIcons();
}

/**
 * @description This code will read all the files in the combined directory,
 * transform the data in the files using the rename and svgstore functions,
 * and write the modified versions to the dist directory.
 * @author Rajdeep
 */
 async function generateSVGSprite(section) {
  const outputFile = fsp.createWriteStream('dist/spectrum-css-icons.svg', { encoding: 'utf8', flags: 'w' });
  outputFile.write('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');
  for (const filePath of await fg('combined/*.svg')) {
    const id = `spectrum-css-icon-${path.basename(filePath, '.svg')}`;
    const content = await fsp.readFile(filePath, 'utf-8');
    if (!content) return;
    outputFile.write(`<symbol id="${id}">${content}</symbol>`);
  }
  outputFile.write('</svg>');
  outputFile.end();
}

/**
 * @description This code defines a getSVGSpriteTask function that takes a
 * size parameter and returns a
 * function that generates an SVG sprite for the specified size.
 * The returned function reads all the files in the specified directory,
 * transforms the data in the files using the rename and svgstore functions, and writes
 * the modified versions to the dist directory
 * @param {*} size
 * @author Rajdeep
 */
 function getSVGSpriteTask(size) {
  return function generateSVGSprite() {
    const files = fg.sync(`${size}/*.svg`).map(filePath => {
      return {
        path: filePath,
        name: 'spectrum-css-icon-' + path.basename(filePath, '.svg')
      };
    });
    let svgString = '';
    files.forEach(file => {
      svgString += fs.readFileSync(file.path, 'utf-8');
    });
    const sprite = '<svg xmlns="http://www.w3.org/2000/svg">\n' +
      files.map(file => `<symbol id="${file.name}" viewBox="0 0 24 24">${fs.readFileSync(file.path, 'utf-8')}</symbol>`).join('\n') +
      '\n</svg>';
    fs.writeFileSync(`dist/spectrum-css-icons-${size}.svg`, sprite);
  };
}

const generateSVGSpriteMedium = getSVGSpriteTask('medium');
const generateSVGSpriteLarge = getSVGSpriteTask('large');

const buildIcons = async function() {
  generateSVGSpriteMedium();
  generateSVGSpriteLarge();
  generateSVGSprite();
}

const build = async function() {
  return await Promise.all([
    buildIcons(),
    tasks.buildCSS()
  ]);
}

exports.updateIcons = updateIcons;
exports.build = exports.buildLite = exports.buildHeavy = exports.buildMedium = build;
exports.default = build;
