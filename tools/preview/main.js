import { resolve } from "path";
import { readdirSync } from "fs";

import { mergeConfig } from "vite";

const componentsPath = resolve(__dirname, "../../components");
const componentPkgs =
	readdirSync(componentsPath, {
		withFileTypes: true,
	})
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name) ?? [];

export default {
	stories: ["../../components/*/stories/*.stories.js"],
	rootDir: "../../",
	staticDirs: ["../../assets"],
	framework: {
		name: "@storybook/web-components-vite",
		options: {
			build: {
				outDir: "./storybook-static",
				assetsDir: "../../assets",
				sourcemap: "inline",
			},
		},
	},
	addons: [
		{
			name: "@storybook/addon-essentials",
			// Supported booleans: actions, controls, docs, toolbars, measure, outline.
			options: {
				viewport: false, // Don't need viewports b/c the medium/large contexts are used to support scaling.
				backgrounds: false, // Don't need backgrounds b/c this is handled by the color contexts.
				configureJSX: false, // Enables JSX support in MDX for projects that aren't configured to handle the format.
				transcludeMarkdown: false, // Support markdown in MDX files.
			},
		},
		// https://github.com/storybookjs/storybook/tree/next/code/addons/a11y
		"@storybook/addon-a11y",
		// https://www.npmjs.com/package/@whitespace/storybook-addon-html
		"@whitespace/storybook-addon-html",
		// https://storybook.js.org/addons/@etchteam/storybook-addon-status
		"@etchteam/storybook-addon-status",
	],
	core: {
		builder: "@storybook/builder-vite",
	},
	async viteFinal(config) {
		// Merge custom configuration into the default config
		return mergeConfig(config, {
			// Add dependencies to pre-optimization
			optimizeDeps: {
				include: ["@storybook/web-components-vite"],
				exclude: ["lit", "lit-html"],
			},
			resolve: {
				modules: [resolve(__dirname, "../../node_modules")],
				alias: componentPkgs.reduce((pkgs, dir) => {
					const pkg = require(resolve(componentsPath, dir, "package.json"));
					pkgs[pkg.name] = resolve(componentsPath, dir);
					return pkgs;
				}, {}),
			},
		});
	},
	env: {
		MIGRATED_PACKAGES: componentPkgs.filter((dir) =>
			import(resolve(componentsPath, dir, "package.json"), {
				assert: { type: "json" },
			})
				.then((pkg) => {
					if (
						pkg.devDependencies &&
						pkg.devDependencies["@spectrum-css/component-builder-simple"]
					) {
						return Promise.resolve(true);
					}
					return Promise.resolve(false);
				})
				.catch(() => {
					return Promise.resolve(false);
				})
		),
	},
	// features: {
	// 	/* Code splitting flag; load stories on-demand */
	// 	storyStoreV7: false,
	// 	/* Builds stories.json to help with on-demand loading */
	// 	buildStoriesJson: false,
	// },
	docs: {
		autodocs: true,
		defaultName: "Docs",
	},
};
