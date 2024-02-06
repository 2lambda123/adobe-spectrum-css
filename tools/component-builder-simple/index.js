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
 * Determines the package name from a file path
 * @param {string} filePath
 * @returns {string}
 */
function getPackageFromPath(filePath = process.cwd()) {
	const parts = filePath.split(path.sep);

	// Capture component name from a local or node_modules syntax
	if (parts.includes("components") || parts.includes("@spectrum-css")) {
		const index = parts.indexOf("components") ?? parts.indexOf("@spectrum-css");
		return parts[index + 1];
	}

	// Check local root-level packages such as ui-icons & tokens
	if (parts.includes("ui-icons")) return "ui-icons";
	if (parts.includes("tokens")) return "tokens";

	// This is a fallback best-guess scenario:
	// Split the path from root dir and capture the first folder as the package name
	const guessParts = path.relative(dirs.root, filePath).split(path.sep);
	return guessParts[0];
}

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

async function build({ cwd, clean = false } = {}) {
    // This fetches the content of the files and returns an array of objects with the content and input paths
    const contentData = await fetchContent(["index.css", "themes/spectrum.css", "themes/*.css"], {
        cwd,
        shouldCombine: true,
        clean,
    });

    return Promise.all(
        contentData.map(async ({ content, input }) => {
            return Promise.all([
                // This was buildCSS
                processCSS(content, input, path.join(cwd, "dist/index.css"), { cwd, clean }).then(async () => {
                    // Copy index.css to index-vars.css for backwards compat
                    return fsp.copyFile(path.join(cwd, "dist/index.css"), path.join(cwd, "dist/index-vars.css")).then(() => {
                        console.log(`${"✓".green}  ${"dist/index-vars.css".yellow} (${"deprecated".gray})`);
                    }).catch((err) => {
                        if (!err) return;
                        console.log(`${"✗".red}  ${"dist/index.css".gray} could not be copied to ${"dist/index-vars.css".yellow}`);
                        return Promise.reject(err);
                    });
                }),
                // This was buildCSSWithoutThemes
                processCSS(content, input, path.join(cwd, "dist/index-base.css"), {
                    cwd,
                    clean,
			        checkUnused: false,
                    splitinatorOptions: {
                        noFlatVariables: true,
                    },
                }),
            ]);
        })
    );
}

async function buildThemes({ cwd, clean = false } = {}) {
    // This fetches the content of the files and returns an array of objects with the content and input paths
    const contentData = await fetchContent([
        "themes/*.css",
    ], {
        cwd,
        shouldCombine: false,
        clean,
        ignore: ["themes/express.css"],
    });

    return Promise.all(
        contentData.map(async ({ content, input }) =>
            processCSS(content, input, path.join(cwd, "dist/themes", path.basename(input)), {
                cwd,
                clean,
                checkUnused: false,
                splitinatorOptions: {
                    noSelectors: true,
                },
            })
        )
    );
}

async function buildThemeIndex({ cwd, clean = false } = {}) {
    // This fetches the content of the files and returns an array of objects with the content and input paths
    const contentData = await fetchContent([
        "themes/spectrum.css", // spectrum comes first
        "themes/*.css",
    ], {
        cwd,
        shouldCombine: true,
        clean,
    });

    return Promise.all(
        contentData.map(async ({ content, input }) =>
            processCSS(content, input, path.join(cwd, "dist/index-theme.css"), {
                cwd,
                clean,
                checkUnused: false,
                splitinatorOptions: {
                    noSelectors: true,
                },
            }).then((results) =>
                Promise.all(
                    results.filter(Boolean).map((result) => {
                        // was buildExpressTheme
                        return processCSS(result, path.join(cwd, "dist/index-theme.css"), path.join(cwd, "dist/themes/express.css"), {
                            cwd,
                            clean,
                            checkUnused: false,
                            additionalPlugins: [
                                require("postcss-combininator")
                            ],
                        });
                    })
                )
            )
        )
    );
}

async function main({
    componentName,
    cwd = path.join(dirs.components, componentName),
    clean = false
} = {}) {
    if (!cwd && (componentName || process.env.NX_TASK_TARGET_PROJECT)) {
        cwd = path.join(dirs.components, componentName ?? process.env.NX_TASK_TARGET_PROJECT);
    }

    if (!componentName) {
        componentName = cwd ? getPackageFromPath(cwd) : process.env.NX_TASK_TARGET_PROJECT;
    }

    const key = printHeader("", { timerKey: `[build] ${`@spectrum-css/${componentName}`.cyan}`, icon: '🔨' });

    return Promise.all([
        build({ cwd, clean }),
        buildThemes({ cwd, clean }),
        buildThemeIndex({ cwd, clean }),
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

exports.processCSS = processCSS;
exports.fetchContent = fetchContent;
exports.default = main;
