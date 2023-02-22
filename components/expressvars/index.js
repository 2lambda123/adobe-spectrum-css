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

const fsp = require("fs").promises;
const path = require("path");

const del = require("del");
const fg = require("fast-glob");

const updateDNA = require("./tasks/updateDNA");

/**
 * @description This code will define a build function that performs a series of tasks in a
 * @returns {Promise<void>}
 */
const build = async () => {
  const fileReadWrite = async (source, destination, transform = (result) => result) => {
    const content = await fsp.readFile(source, "utf-8").then(transform).catch(console.warn);
    if (!content) return Promise.resolve();
    return fsp.writeFile(path.join(destination, path.basename(source)), content);
  };

  await del(["dist/*"]);
  await Promise.all([
    fsp.mkdir("dist/globals/", { recursive: true }).catch(),
    fsp.mkdir("dist/components/", { recursive: true }).catch(),
  ]);

  const promises = [
    // copyMetadata
    fsp.copyFile("json/spectrum-metadata.json", path.join("dist/spectrum-metadata.json")),
    // processColorAliases
    fileReadWrite("css/globals/spectrum-colorAliases.css", "dist/globals/spectrum-colorAliases.css", (result) => {
      return result.replace(/:root/, ["darkest", "dark", "light", "lightest"].map((stop) => `.spectrum--${stop}`).join(",\n"));
    }),
    // processDimensionAliases
    fileReadWrite("css/globals/spectrum-dimensionAliases.css", "dist/globals/spectrum-dimensionAliases.css", (result) => {
      result.replace(/:root/, ['medium', 'large'].map(scale => `.spectrum--${scale}`).join(',\n'));
    })
  ];

  const copyGlobals = new Promise(resolve => {
    fg.stream([
      "css/globals/*.css",
      "!css/globals/spectrum-dimensionAliases.css",
      "!css/globals/spectrum-colorAliases.css",
    ]).on("data", (file) => {
      promises.push(
        fileReadWrite(file, "dist/globals/", (result) => result.replace(/:root {/, ".spectrum {"))
      );
    }).on("close", resolve);
  });

  const copySources = new Promise(resolve => {
    fg.stream([
      "css/themes/*.css",
      "css/scales/*.css"
    ]).on("data", (file) => {
      promises.push(
        fileReadWrite(file, "dist/", (result) => {
          const className = path.basename(file, ".css").replace("-", "--");
          return result.replace(":root", `.${className}`);
        })
      );
    }).on("close", resolve);
  });

  const copyComponents = new Promise(resolve => {
    fg.stream([
      "!css/components/index.css",
      "css/components/*.css"
    ]).on("data", (file) => {
      promises.push(
        fileReadWrite(file, "dist/components/", (result) => result.replace(/:root/, ".spectrum")),
      );
    }).on("close", resolve);
  });

  const globalsStream = new Promise(resolve => {
    const stream = fsp.createWriteStream('dist/spectrum-global.css', {
      flags: 'w'
    }).on('error', console.warn).on('close', () => resolve);

    let content;
    fg.stream([
      "css/globals/*.css",
      "!css/globals/index.css",
      "!css/globals/spectrum-dimensionAliases.css",
      "!css/globals/spectrum-colorAliases.css",
    ])
      .on("ready", content += `.spectrum {\n`)
      .on("data", async (file) => {
        const readIn = await fsp.readFile(file, "utf-8").then((data) => data.replace(/:root {/, "").replace(/}/, ""));
        if (!readIn) return;
        content += readIn;
        content += `  /* ${path.basename(file)} */\n`;
      })
      .on("end", () => {
        content += `\n}\n`;
        fg.stream([
          'dist/globals/spectrum-dimensionAliases.css',
          'dist/globals/spectrum-colorAliases.css',
          'custom.css'
        ])
          .on('ready', () => stream.write(content))
          .on('data', async (file) => {
            const fileContent = await fsp.readFile(file, 'utf-8').then(result => {
              if (file.endsWith('Aliases.css')) {
                return result.replace('{', `{\n  /* ${path.basename(file)} */`);
              }
              return result;
            }).catch(console.warn);
            stream.write(fileContent);
          })
          .on("end", () => stream.end());
      });
  });

  return Promise.all([
    ...promises,
    copyGlobals,
    copySources,
    copyComponents,
    globalsStream,
  ]);
}

/**
 * @description This code defines an update function that performs a series of tasks
 */
exports.update = async () => {
  await updateDNA();
  return build();
};

exports.clean = del("dist/*");
exports.default = build;
exports.build = exports.buildLite = exports.buildHeavy = exports.buildMedium = build;
