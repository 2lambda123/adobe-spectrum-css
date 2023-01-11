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
const fs = require('fs')
const StyleDictionary = require('style-dictionary').extend('config.js');
const fg = require('fast-glob')
const path = require('path')
const async = require('async')

async function clean() {
  const del = await import('del');
  return del('dist/*');
}

async function concatIndex() {
  const files = await fg([
    'dist/css/*.css',
    'dist/css/spectrum/*.css',
    'dist/css/express/*.css',
    'custom-spectrum/*.css',
    'custom-express/*.css'
  ]);

  let indexCss = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    indexCss += fs.readFileSync(file, 'utf8');
  }

  fs.writeFileSync('dist/index.css', indexCss);
}

async function buildCustomSpectrum() {
  const files = await fg('custom-spectrum/*.css');
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    fs.copyFileSync(file, `dist/css/spectrum/${path.basename(file)}`);
  }
}

async function buildCustomExpress() {
  const files = await fg('custom-express/*.css');
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    fs.copyFileSync(file, `dist/css/express/${path.basename(file)}`);
  }
}

const buildCustoms = (callback) => {
  async.parallel([buildCustomSpectrum, buildCustomExpress], callback);
};

function styleDictionary(cb) {
  StyleDictionary.buildAllPlatforms();
  cb();
}

exports.clean = clean;
exports.build = exports.buildLite = exports.buildMedium = exports.default = (callback) => {
  async.series([clean, styleDictionary, buildCustoms, concatIndex], callback);
};

exports.rebuildCustoms = (callback) => async.series([
  buildCustoms,
  concatIndex
], callback);
