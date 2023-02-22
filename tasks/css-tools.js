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

const fsp = require('fs').promises;
const path = require('path');

const postcss = require('postcss');

const processors = require('./processors.js');

// const { postCSSPlugins, wrapCSSResult } = cssProcessing;
const configPath = path.resolve(path.join(__dirname, '../config'));
const header = await fsp.readFile(path.join(configPath, 'license.js'), 'utf8').then(result => {
    return result.replace('<%= YEAR %>', new Date().getFullYear());
}).catch(console.warn);

export const processCSS = async (cssPath) => {
    const originCSS = await fsp.readFile(cssPath, 'utf8').catch(console.warn);
    if (!originCSS) return;

    const writeStream = fsp.writeStream(cssPath, { flags: 'w' });
    if (header) writeStream.write(header);

    const plugins = processors.getProcessors(false, false) || [];
    const processedCSS = await postcss(plugins)
        .process(originCSS, { from: cssPath })
        .then((result) => result.css)
        .catch(console.error);

    if(cssPath.includes('components/vars')) {
        writeStream.write(originCSS);
    }

    writeStream.write(processedCSS);
    writeStream.close();

    Promise.resolve();
};
