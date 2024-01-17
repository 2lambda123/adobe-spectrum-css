import DocumentationTemplate from './DocumentationTemplate.mdx';

import {
	withActions,
	withContextWrapper,
	withLanguageWrapper,
	withReducedMotionWrapper,
	withTestingPreviewWrapper,
	withTextDirectionWrapper,
} from "./decorators";

import { argTypes, globalTypes } from "./types";

// https://github.com/storybookjs/storybook-addon-console
import "@storybook/addon-console";
import { setConsoleOptions } from "@storybook/addon-console";

const panelExclude = setConsoleOptions({}).panelExclude || [];
setConsoleOptions({
	panelExclude: [...panelExclude, /deprecated/, /TypeError/, /postcss-dropunusedvars/],
	log: "🔵 [log]",
    warn: "🟡 [warn]",
    error: "🔴 [error]",
});

import "@spectrum-css/vars/dist/spectrum-global.css";

import "@spectrum-css/vars/dist/spectrum-large.css";
import "@spectrum-css/vars/dist/spectrum-medium.css";

import "@spectrum-css/vars/dist/spectrum-dark.css";
import "@spectrum-css/vars/dist/spectrum-darkest.css";
import "@spectrum-css/vars/dist/spectrum-light.css";

import "@spectrum-css/expressvars/dist/spectrum-global.css";
import "@spectrum-css/expressvars/dist/spectrum-large.css";
import "@spectrum-css/expressvars/dist/spectrum-medium.css";

import "@spectrum-css/expressvars/dist/spectrum-dark.css";
import "@spectrum-css/expressvars/dist/spectrum-darkest.css";
import "@spectrum-css/expressvars/dist/spectrum-light.css";

import "@spectrum-css/tokens";

import "./assets/storybook-preview.css";
import "./global.js";

/** @type import('@storybook/types').StorybookParameters & import('@storybook/types').API_Layout */
export const parameters = {
	layout: "padded",
	showNav: true,
	showTabs: true,
	showPanel: true,
	panelPosition: "bottom",
	showToolbar: true,
	isFullscreen: false,
	chromatic: {
		/** @note not activating testing modes until component snapshots are reduced */
		// modes: allModes,
	},
	controls: {
		expanded: true,
		hideNoControlsWarning: true,
		sort: "requiredFirst",
	},
	html: {
		root: "#root-inner",
		removeComments: /^.*lit.*$/,
		prettier: {
			tabWidth: 4,
			useTabs: false,
			htmlWhitespaceSensitivity: "strict",
		},
		highlighter: {
			showLineNumbers: true,
			wrapLines: true,
		},
	},
	docs: {
    	page: DocumentationTemplate,
		story: {
			inline: true,
			iframeHeight: "200px",
		},
		source: {
			type: "dynamic",
			language: "html",
		},
	},
	status: {
		statuses: {
			migrated: {
				background: "#f0f0f0",
				color: "#444",
				description: "Migrated to the latest tokens.",
			},
		},
	},
};

export default {
	globalTypes,
	argTypes,
	args: {
		customClasses: [],
	},
	parameters,
	decorators: [
		withTextDirectionWrapper,
		withLanguageWrapper,
		withReducedMotionWrapper,
		withContextWrapper,
		withTestingPreviewWrapper,
		withActions,
	],
};
