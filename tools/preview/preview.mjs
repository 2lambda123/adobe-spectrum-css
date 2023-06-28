import {
	withContextWrapper,
	withTextDirectionWrapper,
	withLanguageWrapper,
	withReducedMotionWrapper,
	// withSizingWrapper,
} from "@spectrum-css/addon-toolkit/decorators";

import { withActions } from "@storybook/addon-actions/decorator";

// https://github.com/storybookjs/storybook-addon-console
import { setConsoleOptions } from "@storybook/addon-console";

const panelExclude = setConsoleOptions({}).panelExclude || [];
setConsoleOptions({
	panelExclude: [...panelExclude, /deprecated/, /TypeError/],
});

// Loading typography on every page because it's a useful utility
import "@spectrum-css/typography";
import "@spectrum-css/site";

import "@adobe/spectrum-css-workflow-icons/dist/spectrum-icons.svg";
import "@spectrum-css/icon/dist/spectrum-css-icons.svg";

import "./global.js";

// Global properties added to each component;
//      determines what stylesheets are loaded
export const argTypes = {
	/* None of these should show up in the args table but are necessary for rendering the templates */
	rootClass: {
		name: "Class name",
		type: { name: "string", required: true },
		table: { disable: true },
		control: "text",
	},
	customClasses: {
		name: "Custom classes",
		type: { name: "string", required: false },
		table: { disable: true },
		control: "object",
	},
	id: {
		name: "Element ID",
		type: { name: "string", required: false },
		table: { disable: true },
		control: "text",
	},
};

export const args = {
	customClasses: [],
};

export const parameters = {
	layout: "padded", // Valid: 'centered' | 'fullscreen' | 'padded' | 'none';
	showNav: true,
	showPanel: true,
	panelPosition: "bottom",
	showToolbar: false,
	isFullscreen: false,
	controls: {
		expanded: true,
		hideNoControlsWarning: true,
		sort: "requiredFirst",
	},
	html: {
		root: "#root-inner",
		removeComments: true,
		prettier: {
			tabWidth: 4,
			useTabs: false,
			htmlWhitespaceSensitivity: "ignore",
		},
		highlighter: {
			showLineNumbers: true,
			wrapLines: true,
		},
	},
	docs: {
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

export const decorators = [
	withTextDirectionWrapper,
	withLanguageWrapper,
	withReducedMotionWrapper,
	withContextWrapper,
	withActions,
];

export default {
	globalTypes,
	argTypes,
	args,
	parameters,
	decorators,
};
