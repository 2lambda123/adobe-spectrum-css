import isChromatic from "chromatic/isChromatic";
import { useEffect } from "@storybook/preview-api";
import { withActions } from "@storybook/addon-actions/decorator";

import { html } from "lit";
import { when } from "lit/directives/when.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import workflowIcons from "@adobe/spectrum-css-workflow-icons/dist/spectrum-icons.svg?raw";
import uiIcons from "@spectrum-css/icon/dist/spectrum-css-icons.svg?raw";

// https://github.com/storybookjs/storybook-addon-console
import { setConsoleOptions } from "@storybook/addon-console";

const panelExclude = setConsoleOptions({}).panelExclude || [];
setConsoleOptions({
	panelExclude: [...panelExclude, /deprecated/, /TypeError/],
});

import "@spectrum-css/vars/dist/spectrum-medium.css";
import "@spectrum-css/vars/dist/spectrum-large.css";

import "@spectrum-css/vars/dist/spectrum-light.css";
import "@spectrum-css/vars/dist/spectrum-dark.css";
import "@spectrum-css/vars/dist/spectrum-darkest.css";

import "@spectrum-css/vars/dist/spectrum-global.css";

import "@spectrum-css/expressvars/dist/spectrum-medium.css";
import "@spectrum-css/expressvars/dist/spectrum-large.css";

import "@spectrum-css/expressvars/dist/spectrum-light.css";
import "@spectrum-css/expressvars/dist/spectrum-dark.css";
import "@spectrum-css/expressvars/dist/spectrum-darkest.css";

import "@spectrum-css/expressvars/dist/spectrum-global.css";

import "@spectrum-css/tokens";

// Loading typography on every page because it's a useful utility
import "@spectrum-css/typography";
import "@spectrum-css/site";

import "./global.js";

// Rendered as controls; these properties are assigned
//      to the document root element
// @todo: resolve errors on 'name' and 'title' in console
export const globalTypes = {
	textDirection: {
		title: "Text Direction",
		description: "Direction of the content flow",
		showName: true,
		defaultValue: "ltr",
		toolbar: {
			items: [
				{ value: "ltr", title: "ltr", right: "left to right" },
				{ value: "rtl", title: "rtl", right: "right to left" },
			],
			dynamicTitle: true,
		},
	},
	lang: {
		title: "Language",
		showName: true,
		icon: "globe",
		description: "Language of the content",
		defaultValue: "en-US",
		toolbar: {
			items: [
				{ value: "en-US", title: "🇺🇸", right: "English (US)" },
				{ value: "ja", title: "🇯🇵", right: "Japanese" },
				{ value: "ko", title: "🇰🇷", right: "한국어" },
				{ value: "zh", title: "🇨🇳", right: "中文" },
			],
			dynamicTitle: true,
		},
	},
};

const colors = ["light", "dark", "darkest"];
const scales = ["medium", "large"];

// Global properties added to each component;
//      determines what stylesheets are loaded
export const argTypes = {
	color: {
		name: "Color",
		description: "Controls the color context of the component.",
		type: { required: true },
		table: {
			type: { summary: "light | dark | darkest" },
			defaultValue: { summary: "light" },
			category: "Global",
		},
		options: colors,
		control: {
			type: "select",
			labels: {
				light: "Light (default)",
				dark: "Dark",
				darkest: "Darkest",
			},
		},
	},
	scale: {
		name: "Platform scale",
		description: "Controls the platform scale of the component.",
		table: {
			type: { summary: "medium | large" },
			defaultValue: { summary: "medium" },
			category: "Global",
		},
		type: { required: true },
		options: scales,
		control: {
			type: "radio",
			labels: {
				medium: "Medium (default)",
				large: "Large",
			},
		},
	},
	express: {
		name: "Express",
		description: "The express theme is a variation of Spectrum.",
		table: {
			type: { summary: "boolean" },
			defaultValue: { summary: false },
			category: "Global",
		},
		type: { required: true },
		control: "boolean",
	},
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
	color: "light",
	scale: "medium",
	express: false,
	customClasses: [],
};

/** @type import('@storybook/types').StorybookParameters & import('@storybook/types').API_Layout */
export const parameters = {
	layout: "padded",
	showNav: true,
	showTabs: true,
	showPanel: true,
	panelPosition: "bottom",
	showToolbar: true,
	isFullscreen: false,
	//👇 Defines a list of viewport widths for a single story to be captured in Chromatic.
	chromatic: isChromatic()
		? {
				// viewports: [320, 1200],
				// forcedColors: 'active',
				// prefersReducedMotion: 'reduce',
		  }
		: {},
	controls: {
		expanded: true,
		hideNoControlsWarning: true,
		sort: "requiredFirst",
	},
	html: {
		root: "#html-capture",
		removeComments: true,
		prettier: {
			tabWidth: 2,
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
	(StoryFn, context) => {
		const { globals, args, argTypes } = context;

		const textDirection = globals.textDirection;
		const lang = globals.lang;

		const getDefaultValue = (type) => {
			if (!type) return null;
			if (type.defaultValue) return type.defaultValue;
			return type.options ? type.options[0] : null;
		};

		// This property informs which context stylesheets to source
		//    but does not source a stylesheet for itself
		/** @type boolean */
		const isExpress = args.express
			? args.express
			: getDefaultValue(argTypes.express);
		/** @type string */
		const color = args.color ? args.color : getDefaultValue(argTypes.color);
		/** @type string */
		const scale = args.scale ? args.scale : getDefaultValue(argTypes.scale);

		useEffect(() => {
			document.documentElement.dir = textDirection;
			document.documentElement.lang = lang;

			// This adds the classes but not the stylesheet
			document.body.classList.toggle("spectrum--express", isExpress);

			for (const c of colors) {
				document.body.classList.toggle(`spectrum--${c}`, c === color);
			}

			for (const s of scales) {
				document.body.classList.toggle(`spectrum--${s}`, s === scale);
			}
		}, [textDirection, lang, isExpress, color, scale]);

		return html` <div id="html-capture">${StoryFn(context)}</div>
			<!-- Workflow icons -->
			${unsafeSVG(workflowIcons)}
			<!-- UI icons -->
			${unsafeSVG(uiIcons)}`;
	},
	withActions,
];

export default {
	globalTypes,
	argTypes,
	args,
	parameters,
	decorators,
};
