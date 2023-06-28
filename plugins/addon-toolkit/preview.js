import "@spectrum-css/vars/dist/spectrum-medium.css";
// import "@spectrum-css/vars/dist/spectrum-large.css";

import "@spectrum-css/vars/dist/spectrum-light.css";
// import "@spectrum-css/vars/dist/spectrum-dark.css";
// import "@spectrum-css/vars/dist/spectrum-darkest.css";

import "@spectrum-css/vars/dist/spectrum-global.css";

import "@spectrum-css/expressvars/dist/spectrum-medium.css";
// import "@spectrum-css/expressvars/dist/spectrum-large.css";

import "@spectrum-css/expressvars/dist/spectrum-light.css";
// import "@spectrum-css/expressvars/dist/spectrum-dark.css";
// import "@spectrum-css/expressvars/dist/spectrum-darkest.css";

import "@spectrum-css/expressvars/dist/spectrum-global.css";

import "@spectrum-css/tokens";

export default {
	globalTypes: {
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
		color: {
			name: "Color",
			description: "Controls the color context of the component.",
			type: { required: true },
			table: {
				type: { summary: "light | dark | darkest" },
				defaultValue: { summary: "light" },
				category: "Global",
			},
			options: ["light", "dark", "darkest"],
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
			options: ["medium", "large"],
			control: {
				type: "radio",
				labels: {
					medium: "Medium (default)",
					large: "Large",
				},
			},
		},
		// @todo https://jira.corp.adobe.com/browse/CSS-314
		reducedMotion: {
			name: "Reduce motion",
			title: "Reduce motion",
			description: "Reduce animation and transitions",
			table: {
				type: { summary: "boolean" },
				defaultValue: { summary: false },
				category: "Global",
			},
			type: { required: true },
			control: "boolean",
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
	},
	globals: {
		textDirection: "ltr",
		lang: "en-US",
		color: "light",
		scale: "medium",
		reducedMotion: false,
		express: false,
	},
};
