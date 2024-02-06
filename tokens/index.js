/*!
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const fg = require("fast-glob");
const postcss = require("postcss");
const postcssrc = require("postcss-load-config");

require("colors");

/**
 * A source of truth for commonly used directories
 * @type {object} dirs
 * @property {string} dirs.root
 * @property {string} dirs.components
 * @property {string} dirs.site
 * @property {string} dirs.publish
 */
const dirs = {
	root: path.join(__dirname, "../.."),
	components: path.join(__dirname, "../../components"),
	site: path.join(__dirname, "../../site"),
	publish: path.join(__dirname, "../../dist"),
};

/** @type {(string) => string} */
const relativePrint = (filename, { cwd = dirs.root }) => path.relative(cwd, filename);

const printHeader = (content, { timerKey, icon }) => {
	if (timerKey) console.time(timerKey);
	console.log(`\n\n${timerKey ? `${timerKey} ` : ""}${icon ? `${icon} ` : ""} ${content}`);
	console.log(`${"".padStart(30, "-")}`);
	return timerKey;
};

const printFooter = (timerKey) => {
	if (timerKey) console.timeEnd(timerKey);
	console.log("");
};

/**
 * Copy static assets to the publish directory
 * @param {string} content
 * @param {string} input
 * @param {string} output
 * @param {object} options
 * @param {string} [options.cwd]
 * @param {boolean} [options.clean=false]
 * @returns {Promise<(string|void)[]>} Returns either the CSS content or void
 */
async function processCSS(content, input, output, {
    cwd,
    clean = false,
    ...postCSSOptions
} = {}) {
    if (!content) return Promise.reject(new Error(`This function requires content be provided`));

    const { plugins, options } = await postcssrc(
        {
            cwd,
            env: process.env.NODE_ENV ?? "development",
            from: input,
            to: output,
            ...postCSSOptions,
        },
        __dirname // This is the path to the directory where the postcss.config.js lives
    );

    const result = await postcss(plugins).process(content, options);

    if (result.error) return Promise.reject(result.error);

    if (result.warnings().length) {
        result.warnings().forEach((warning) => {
            console.log(`${`⚠`.yellow} ${warning}`);
        });
    }

    if (!result.css) return Promise.reject(new Error(`No CSS was generated from the provided content for ${relativePrint(input, { cwd })}`));

    if (!fs.existsSync(path.dirname(output))) {
        await fsp.mkdir(path.dirname(output), { recursive: true }).catch((err) => {
            if (!err) return;
            // @todo pretty print these are relative paths
            console.log(`${"✗".red}  problem making the ${relativePrint(path.dirname(output), { cwd }).yellow} directory`);
            return Promise.reject(err);
        });
    }

    const promises = [
        fsp.writeFile(output, result.css).then(() => {
            console.log(`${"✓".green}  ${relativePrint(output, { cwd }).yellow}`);
            return result.css;
        }).catch((err) => {
            if (!err) return;
            console.log(`${"✗".red}  ${relativePrint(output, { cwd }).yellow} could not be written`);
            return Promise.reject(err);
        })
    ];

    if (result.map) {
        promises.push(
            fsp.writeFile(`${output}.map`, result.map).then(() => {
                console.log(`${"✓".green}  ${relativePrint(`${output}.map`, { cwd }).yellow}`);
            }).catch((err) => {
                if (!err) return;
                console.log(`${"✗".red}  ${relativePrint(`${output}.map`, { cwd }).yellow} could not be written`);
                return Promise.reject(err);
            })
        );
    }

    return Promise.all(promises);
}

/**
 * Copy static assets to the publish directory
 * @param {(string|RegExp)[]} globs
 * @param {object} options
 * @param {string} [options.cwd]
 * @param {string} outputDir
 * @returns {Promise<{ content: string, input: string }[]>}
 */
async function fetchContent(globs = [], {
    cwd,
    shouldCombine = false,
    ...fastGlobOptions
} = {}) {
	const files = await fg(globs, {
		allowEmpty: true,
		onlyFiles: true,
		...fastGlobOptions,
		cwd,
    });

    if (!files.length) return Promise.resolve([]);

    const fileData = await Promise.all(
        files.map(async (file) => ({
            input: path.join(cwd, file),
            content: await fsp.readFile(path.join(cwd, file), "utf8")
        }))
    );

    // Combine the content into 1 file; @todo do this in future using CSS imports
    if (shouldCombine) {
        let content = "";
        fileData.forEach(dataset => {
            if (dataset.content) content += '\n\n' + dataset.content;
        });

        return Promise.resolve([{
            content,
            input: fileData[0].input
        }]);
    }

    return Promise.all(
        files.map(async (file) => ({
            content: await fsp.readFile(path.join(cwd, file), "utf8"),
            input: path.join(cwd, file),
        }))
    );
}

async function build(files = [], { cwd = __dirname, shouldCombine = true }) {
    // This fetches the content of the files and returns an array of objects with the content and input paths
    const contentData = await fetchContent(files, { cwd, shouldCombine });
    return Promise.all(
        contentData.map(async ({ content, input }) => {
            let outputPath = shouldCombine ? path.join(cwd, "dist/index.css") : input;
            const parts = input.split(path.sep);
            if (!shouldCombine && !parts.includes("dist")) {
                const folderName = parts.find((part) => /custom-/.test(part)).split("-")[1];
                outputPath = path.join(cwd, "dist", folderName, path.basename(input));
            }

            return processCSS(content, input, outputPath, { cwd, clean });
        })
    );
}


// "postcss ./dist/css/*.css ./dist/css/spectrum/*.css ./dist/css/express/*.css --replace",
// "cat ./dist/css/*.css ./dist/css/spectrum/*.css ./dist/css/express/*.css | postcss --output ./dist/index.css",

async function main() {
    const key = printHeader("", { timerKey: `[build] ${`@spectrum-css/tokens`.cyan}`, icon: '🔨' });

    return Promise.all([
        build(["dist/css/*.css", "custom-(express|spectrum)/*.css"], { shouldCombine: false }).then(() => {
            return build(["dist/css/*.css", "dist/css/spectrum/*.css", "dist/css/express/*.css"], { shouldCombine: true });
        }),
    ]).then(() => {
        console.log(`${"".padStart(30, "-")}`);
        printFooter(key);
    }).catch((err) => {
        console.trace(err);
        console.log(`${"".padStart(30, "-")}`);
        printFooter(key);
        process.exit(1);
    });
};
