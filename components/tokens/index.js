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

const fs = require('fs');
const fsp = fs.promises;
const rm = require('rimraf');
const fg = require('fast-glob');

const StyleDictionary = require('style-dictionary').extend('style-dictionary.config.js');

async function concatIndex() {
    const ws = fs.createWriteStream('dist/index.css', {flags: 'w'});

    const files = await fg([
        'dist/css/*.css',
        'dist/css/spectrum/*.css',
        'dist/css/express/*.css',
        'custom-spectrum/*.css',
        'custom-express/*.css'
    ]).catch(console.warn);

    for (const file of files) {
        const content = await fsp.readFile(file).catch(console.warn);
        ws.write(content);
    }

    ws.end();
}

async function buildCustoms() {
    const directory = await fg(['custom-*/'], {
        onlyDirectories: true,
    }).catch(console.warn);
    if (!fs.existsSync('dist/css/spectrum')) {
        fs.mkdirSync('dist/css/spectrum', { recursive: true });
    }

    fs.copy(directory, 'dist/css/spectrum/', console.warn);
}

function styleDictionary(cb) {
  StyleDictionary.buildAllPlatforms();
  cb();
}

exports.clean = rm('dist/*');
exports.default = async () => {
  await rm('dist/*');
  styleDictionary();
  await buildCustoms();
  await concatIndex();
};

exports.rebuildCustoms = async () => {
  await buildCustoms();
  await concatIndex();
};
