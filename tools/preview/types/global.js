// Rendered as controls; these properties are assigned to the document root element

/** @type import('@storybook/types').GlobalTypes */
export default {
	color: {
		name: "Color",
		description: "Controls the color context of the component",
		defaultValue: "light",
        icon: "paintbrush",
        type: "string",
		toolbar: {
			items: [
				{ value: "light", title: "Light", icon: "circlehollow" },
				{ value: "dark", title: "Dark", icon: "circle" },
				{ value: "darkest", title: "Darkest", icon: "circle" },
			],
			dynamicTitle: true,
		},
	},
	scale: {
		name: "Platform scale",
		description: "Controls the platform scale of the component",
		defaultValue: "medium",
        type: "string",
		toolbar: {
			items: [
				{ value: "medium", title: "Medium", icon: "browser" },
				{ value: "large", title: "Large", icon: "mobile" },
			],
			dynamicTitle: false,
		},
	},
	// @todo https://jira.corp.adobe.com/browse/CSS-314
    /** @type import('@storybook/types').InputType */
	reducedMotion: {
		name: "Reduce motion",
		title: "Reduce motion",
		description: "Reduce animation and transitions",
		defaultValue: false,
        type: "boolean",
		toolbar: {
			items: [
				{ value: false, title: "Default", icon: "play" },
				{ value: true, title: "Reduced motion", icon: "stop" },
			],
			dynamicTitle: false,
		},
	},
	express: {
		name: "Express",
		description: "The express theme is a variation of Spectrum",
		defaultValue: false,
        type: "boolean",
		showName: true,
		toolbar: {
			items: [
				{ value: true, title: "Express" },
				{ value: false, title: "Spectrum" },
			],
			dynamicTitle: true,
		},
	},
	textDirection: {
		title: "Text direction",
		description: "Direction of the content flow",
		defaultValue: "ltr",
        type: "string",
		toolbar: {
			items: [
				{ value: "ltr", title: "left to right", icon: "arrowrightalt" },
				{ value: "rtl", title: "right to left", icon: "arrowleftalt" },
			],
			dynamicTitle: false,
		},
	},
	lang: {
		title: "Language",
		description: "Language of the content",
		defaultValue: "en-US",
        type: "string",
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
