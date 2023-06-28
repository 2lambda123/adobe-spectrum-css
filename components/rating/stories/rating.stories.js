// Import the component markup template
import { Template } from "./template.js";

export default {
	title: "Components/Rating",
	description:
		"A rating element is used to display or collect a user's rating of an item as represented by a number of stars.",
	component: "Rating",
	argTypes: {
		isEmphasized: {
			name: "Emphasized styling",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: "boolean",
		},
		isFocused: {
			name: "Focused",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
				disable: true,
			},
			control: "boolean",
		},
		isDisabled: {
			name: "Disabled",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
		isReadOnly: {
			name: "Read only",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: "boolean",
		},
		max: {
			name: "Maximum value",
			type: { name: "number" },
			table: {
				type: { summary: "number" },
				category: "Content",
			},
			control: { type: "number" },
		},
		value: {
			name: "Value",
			type: { name: "number" },
			table: {
				type: { summary: "number" },
				category: "Content",
				disable: true,
			},
			control: { type: "number" },
		},
	},
	args: {
		rootClass: "spectrum-Rating",
		isDisabled: false,
		max: 5,
		value: 3,
	},
	parameters: {
		actions: {
			handles: [],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("rating")
				? "migrated"
				: undefined,
		},
	},
};

export const Default = Template.bind({});
Default.args = {};

export const isReadOnly = Template.bind({});
isReadOnly.args = {
	isReadOnly: true,
};

export const isEmphasized = Template.bind({});
isEmphasized.args = {
	isEmphasized: true,
};

export const isReadOnlyEmphasized = Template.bind({});
isReadOnlyEmphasized.args = {
	isEmphasized: true,
	isReadOnly: true,
};

export const isDisabled = Template.bind({});
isDisabled.args = {
	isDisabled: true,
};

export const isFocused = Template.bind({});
isFocused.args = {
	isFocused: true,
};

export const HighContrast = Default;
HighContrast.parameters = {
	chromatic: { forcedColors: "active" },
};
