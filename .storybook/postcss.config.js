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

const { resolve, basename, dirname } = require("path");
const { existsSync } = require("fs");

const warnCleaner = require("postcss-warn-cleaner");

const simpleBuilder = dirname(
	require.resolve("@spectrum-css/component-builder-simple", {
		paths: [__dirname, resolve(__dirname, "../")],
	})
) ?? resolve(__dirname, "../tools/component-builder-simple");

const legacyBuilder = dirname(
	require.resolve("@spectrum-css/component-builder", {
		paths: [__dirname, resolve(__dirname, "../")],
	})
) ?? resolve(__dirname, "../tools/component-builder");

const postcssrc = require("postcss-load-config");

module.exports = async (ctx) => {
	const file = ctx && Object.keys(ctx) ? ctx.file ?? ctx.to ?? ctx.from : undefined;

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

	const plugins = [];

    /** @todo put together a more robust fallback determination */
	const folderName = file && getPackageFromPath(file);

	const componentPath = resolve(__dirname, "../components");
	const pkgPath = folderName && resolve(componentPath, folderName, "package.json");

	/**
	 * For our token libraries, include a little extra parsing to allow duplicate
	 * token values to exist in parallel and be toggled using args in storybook.
	 */
	if (folderName && ["expressvars", "vars"].includes(folderName)) {
		const isExpress = folderName === "expressvars";
		const modifier = basename(file, ".css").startsWith("spectrum")
			? basename(file, ".css")
					.replace("spectrum-", "")
					.replace("global", "")
			: "";

		plugins.push(
			require("postcss-import")(),
			require("postcss-selector-replace")({
				before: [":root"],
				after: [
					`${isExpress ? ".spectrum--express" : ""}${
						modifier ? `.spectrum--${modifier}` : ""
					}${!isExpress && !modifier ? ".spectrum" : ""}`,
				],
			}),
			...(isExpress
				? [
						require("postcss-prefix-selector")({
							prefix: ".spectrum--express",
							transform(_prefix, selector, prefixedSelector) {
								if (selector.startsWith(".spectrum--express")) return selector;
								/* Smoosh the selectors together b/c they co-exist */
								return prefixedSelector.replace(" ", "");
							},
						}),
				  ]
				: []),
		);
	} else if (folderName && folderName === "tokens") {
		await postcssrc({
			cwd: resolve(componentPath, folderName),
			env: process.env.NODE_ENV ?? "development",
			from: ctx.from ?? file,
			to: ctx.to ?? file,
		}).then((result) => {
			if (!result?.plugins) return;
			plugins.push(...result.plugins);
		});
	} else if (pkgPath && existsSync(pkgPath)) {
		/**
		 * If a path has a package.json, we can assume it's a component and
		 * we want to leverage the correct plugins for it.
		 */
		const {
			peerDependencies = {},
			devDependencies = {},
			dependencies = {}
		} = require(pkgPath);

		const deps = [...new Set([
			...Object.keys(peerDependencies),
			...Object.keys(dependencies),
			...Object.keys(devDependencies),
		])];

		if (
			deps.includes("@spectrum-css/vars")
		) {
			await postcssrc({
				cwd: resolve(componentPath, folderName),
				env: process.env.NODE_ENV ?? "development",
				from: ctx.from ?? file,
				to: ctx.to ?? file,
			}, legacyBuilder).then((result) => {
				if (!result?.plugins) return;
				plugins.push(...result.plugins);
			});
		} else if (ctx.file.split("/").includes("themes")) {
			await postcssrc({
				cwd: resolve(componentPath, folderName),
				env: process.env.NODE_ENV ?? "development",
				from: ctx.from ?? file,
				to: ctx.to ?? file,
				splitinatorOptions: {
					noSelectors: false,
				},
			}, simpleBuilder).then((result) => {
				if (!result?.plugins) return;
				plugins.push(...result.plugins);
			});
		} else {
			await postcssrc({
				cwd: resolve(componentPath, folderName),
				env: process.env.NODE_ENV ?? "development",
				from: ctx.from ?? file,
				to: ctx.to ?? file,
			}, simpleBuilder).then((result) => {
				if (!result?.plugins) return;
				plugins.push(...result.plugins);
			});
		}
	}

	/**
	 * For storybook, add a tool to suppress unnecessary warnings
	 */
	plugins.push(
		warnCleaner({
			ignoreFiles: "**/*.css",
		})
	);

	return { plugins };
};
