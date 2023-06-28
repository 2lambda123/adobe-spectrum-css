const { resolve } = require("path");
const { readdirSync } = require("fs");

const componentsPath = resolve(__dirname, "../../components");
const componentPkgs = readdirSync(componentsPath, {
	withFileTypes: true,
})
	.filter((dirent) => dirent.isDirectory())
	.map((dirent) => dirent.name);

module.exports = {
	stories: [`../../components/*/stories/*.stories.js`],
	rootDir: "../../",
	staticDirs: ["../../assets"],
	addons: [
		// "@storybook/addon-actions/register",
		{
			name: "@storybook/addon-essentials",
			// Supported booleans: actions, controls, docs, toolbars, measure, outline.
			options: {
				viewport: false,
				// Don't need viewports b/c the medium/large contexts are used to support scaling.
				backgrounds: false,
				// Don't need backgrounds b/c this is handled by the color contexts.
				configureJSX: true,
				// Enables JSX support in MDX for projects that aren't configured to handle the format.
				transcludeMarkdown: true, // Support markdown in MDX files.
			},
		},
		{
			name: "@storybook/addon-styling",
			options: {
				postCss: {
					implementation: require("postcss"),
					postcssOptions: {
						config: resolve(__dirname, "postcss.config.js"),
					},
				},
			},
		},
		// https://github.com/storybookjs/storybook/tree/next/code/addons/a11y
		"@storybook/addon-a11y",
		// https://www.npmjs.com/package/@whitespace/storybook-addon-html
		"@whitespace/storybook-addon-html",
		// https://storybook.js.org/addons/@etchteam/storybook-addon-status
		"@etchteam/storybook-addon-status",
		"@spectrum-css/addon-toolkit",
	],
	core: {
		disableTelemetry: true,
	},
	env: {
		MIGRATED_PACKAGES: componentPkgs?.filter((dir) => {
			const pkg = require(resolve(componentsPath, dir, "package.json"));
			if (
				pkg.devDependencies &&
				pkg.devDependencies["@spectrum-css/component-builder-simple"]
			) {
				return true;
			}
			return false;
		}),
	},
	framework: {
		name: "@storybook/web-components-webpack5",
		options: {
			fsCache: true,
			lazyCompilation: true,
		},
	},
	webpackFinal(config) {
		return {
			...config,
			/* Suppress autoprefixer warnings from storybook build */
			ignoreWarnings: [...config.ignoreWarnings, /autoprefixer: /],
			/* Add support for root node_modules imports */
			resolve: {
				...(config.resolve || {}),
				modules: [
					...(config.resolve.modules || []),
					resolve(__dirname, "../../node_modules"),
				],
				alias: {
					...(config.resolve.alias || {}),
					...componentPkgs.reduce((pkgs, dir) => {
						const pkg = require(resolve(componentsPath, dir, "package.json"));
						pkgs[pkg.name] = resolve(componentsPath, dir);
						return pkgs;
					}, {}),
				},
			},
		};
	},
	features: {
		/* Code splitting flag; load stories on-demand */
		storyStoreV7: true,
		/* Builds stories.json to help with on-demand loading */
		buildStoriesJson: true,
	},
	// refs: {
	//   'swc': {
	//     title: 'Spectrum Web Components',
	//     url: 'https://opensource.adobe.com/spectrum-web-components/storybook/',
	//     expanded: false,
	//   },
	// },
	docs: {
		autodocs: true,
		defaultName: "Docs",
	},
};
