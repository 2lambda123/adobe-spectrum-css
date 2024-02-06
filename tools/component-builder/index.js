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

const varDir = path.join(
	path.dirname(
		require.resolve("@spectrum-css/vars")
	),
	".."
);

const coreTokensFile = require.resolve("@spectrum-css/tokens");

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
function getPackageFromPath(filePath) {
	if (!filePath) return;

	// Capture component name from a local or node_modules syntax
	const componentCheck = filePath.match(/(?:components|@spectrum-css)\/(\w+)/);

	if (componentCheck && componentCheck?.[1]) return componentCheck[1];

	// Check local root-level packages such as ui-icons & tokens
	const pkgCheck = filePath.match(/\/(ui-icons|tokens)\//);
	if (pkgCheck && pkgCheck?.[1]) return pkgCheck[1];

	return;
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
    // @todo throw a warning that no content was provided
    if (!content) return Promise.reject(new Error(`This function requires content be provided`));

    const { plugins, options } = await postcssrc(
        {
            cwd: path.dirname(input),
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

    if (!result.css) return Promise.reject(new Error(`No CSS was generated from the provided content for ${input}`));

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
    cwd = cwd,
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

function getVarsFromCSS(css) {
	const variableList = new Set();

	postcss.parse(css).walkRules((rule) => {
		rule.walkDecls((decl) => {
			const matches = decl.value.match(/var\(.*?\)/g);
			if (!matches) return;

			matches.forEach((match) => {
				variableList.add(
					match.replace(/var\((--[\w\-]+),?.*?\)/, "$1").trim()
				);
			});
		});
	});

	return [...variableList];
}

function getVarsDefinedInCSS(css) {
	let variableList = [];
	let root = postcss.parse(css);

	root.walkRules((rule, ruleIndex) => {
		rule.walkDecls((decl) => {
			if (decl.prop.startsWith("--")) {
				let varName = decl.prop;
				if (variableList.indexOf(varName) === -1) {
					variableList.push(varName);
				}
			}
		});
	});
	return variableList;
}

function getClassNames(contents, pkgName) {
	if (pkgName === "page") return [];

	const classNames = new Set();

	postcss.parse(contents).walkRules((rule) => {
		if (rule.type !== "rule") return;

		rule.selectors.forEach((fullSelector) => {
			// Skip compound selectors, they may not start with the component itself
			if (fullSelector.match(/~|\+/)) return true;

			const selector = fullSelector.split(" ").shift();

			const matches = selector.match(/^\.spectrum-[\w]+/);
			if (!matches || !matches[0]) return;

			classNames.add(matches[0]);
		});
	});

	return [...classNames];
}

function getVariableDeclarations(classNames = [], vars = {}) {
	if (!classNames.length) return "";

	const varNames = Object.keys(vars);
	if (!varNames.length) return "";

	return `
${classNames.map((className) => `${className}`).join(",\n")} {
${varNames.map((varName) => `  ${varName}: ${vars[varName]};`).join("\n")}
}
`;
}

async function getAllVars(fileGlobs) {
	const variableList = {};

	const files = await fg(fileGlobs, {
		allowEmpty: true,
	});

	await Promise.all(
		files.map(async (file) => {
			const css = await fsp.readFile(file, "utf8");
			const vars = getVarsDefinedInCSS(css);

			vars.forEach((varName) => {
				variableList[varName] = true;
			});
		})
	);

	return variableList;
}

// Read in all variables used
// Read in all vars from recent DNA
// Include definitions if they refer to a variable, static if not
async function build({ cwd, clean = false } = {}) {
    // This fetches the content of the files and returns an array of objects with the content and input paths
    const contentData = await fetchContent(["index.css"], {
        cwd,
        clean,
        allowEmpty: false,
    });

    return Promise.all(
        contentData.map(async ({ content, input }) => {
            // This was buildIndexVars
            return processCSS(content, input, path.join(cwd, "dist/index.css"), { cwd, clean }).then(async (results) => {
                // Copy index.css to index-vars.css for backwards compat
                return Promise.all([
                    fsp.copyFile(path.join(cwd, "dist/index.css"), path.join(cwd, "dist/index-vars.css")).then(() => {
                        console.log(`${"✓".green}  ${"dist/index-vars.css".yellow} (${"deprecated".gray})`);
                    }).catch((err) => {
                        if (!err) return;
                        console.log(`${"✗".red}  ${"dist/index.css".gray} could not be copied to ${"dist/index-vars.css".yellow}`);
                        return Promise.reject(err);
                    }),
                    // This was bakeVars
                    ...results.filter(Boolean).map(async (result) => {
                        const classNames = getClassNames(result, getPackageFromPath(input));
                        // Find all custom properties used in the component
                        const variableList = getVarsFromCSS(result);

                        // Get literally all of the possible vars (even overridden vars that are different between themes/scales)
                        const allVars = await getAllVars([
                            `${varDir}/css/themes/*.css`,
                            `${varDir}/css/scales/*.css`,
                            `${varDir}/css/components/*.css`,
                            `${varDir}/css/globals/*.css`,
                            `${varDir}/custom.css`,
                            coreTokensFile,
                        ]);

                        // For each color stop and scale, filter the variables for those matching the component
                        const usedVars = variableList.reduce((usedVars, varName) => {
                            // Return if the varName is null/undefined or there is no value found in allVars
                            if (!varName || !allVars[varName]) return usedVars;

                                usedVars[varName] = allVars[varName];
                                return usedVars;
                        }, {});

                        const contents = getVariableDeclarations(classNames, usedVars);
                        return processCSS(contents, input, path.join(cwd, "dist/vars.css"), { cwd, clean });
                    })
                ]);
            });
        })
    );
}

async function main({
    componentName = process.env.NX_TASK_TARGET_PROJECT,
    cwd = path.join(dirs.components, componentName),
    clean = false
} = {}) {
    if (!cwd && (componentName || process.env.NX_TASK_TARGET_PROJECT)) {
        cwd = path.join(dirs.components, componentName ?? process.env.NX_TASK_TARGET_PROJECT);
    }

    if (!componentName && cwd) {
        componentName = getPackageFromPath(cwd);
    }

    const key = printHeader(` (${'legacy'.gray})`, { timerKey: `[build] ${`@spectrum-css/${componentName}`.cyan}`, icon: '🔨' });

    return build({ cwd, clean }).then(() => {
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
