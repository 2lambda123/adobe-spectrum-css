const { resolve, basename } = require("path");
const { existsSync } = require("fs");

/**
 * Determines the package name from a file path
 * @param {string} filePath
 * @returns {string}
 */
function getPackageFromPath(filePath) {
	return filePath.match(`(components|@spectrum-css)\/(.*?)\/`)?.[2];
}

module.exports = (ctx) => {
	const cwd = ctx.cwd ?? process.cwd();
	const plugins = [
		require("postcss-import")({
			root: cwd,
			addModulesDirectories: [join(cwd, "node_modules"), join(__dirname, "node_modules")],
		})
	];

 /** @todo put together a more robust fallback determination */
	const folderName = getPackageFromPath(ctx.file) ?? "tokens";

	/**
	 * For our token libraries, include a little extra parsing to allow duplicate
	 * token values to exist in parallel and be toggled using args in storybook.
	 */
	if (["expressvars", "vars", "tokens"].includes(folderName)) {
		const isExpress = folderName === "expressvars";
		const modifier = basename(ctx.file, ".css").startsWith("spectrum")
			? basename(ctx.file, ".css")
					.replace("spectrum-", "")
					.replace("global", "")
			: "";

		plugins.push(
			require("postcss-selector-replace")({
				before: [":root"],
				after: [
					`${isExpress ? ".spectrum--express" : ""}${
						modifier ? `.spectrum--${modifier}` : ""
					}${!isExpress && !modifier ? ".spectrum" : ""}`,
				],
			}),
			);

			if (isExpress) {
				plugins.push(
						require("postcss-prefix-selector")({
							prefix: ".spectrum--express",
							transform(_prefix, selector, prefixedSelector) {
								if (selector.startsWith(".spectrum--express")) return selector;
								/* Smoosh the selectors together b/c they co-exist */
								return prefixedSelector.replace(" ", "");
							},
						}),
				);
		}
	}

	/**
	 * For storybook, add a tool to suppress unnecessary warnings
	 */
	plugins.push(
		require("postcss-warn-cleaner")({
			ignoreFiles: "**/*.css",
		})
	);

	return { plugins };
};
