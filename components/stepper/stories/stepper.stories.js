// Import the component markup template
import { Template } from "./template.js";

export default {
	title: "Components/Stepper",
	description:
		"A stepper can be used to increment or decrement a value by a specified amount via an up/down button. An input field displays the current value.",
	component: "Stepper",
	argTypes: {
		isQuiet: {
			name: "Quiet",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: "boolean",
		},
		hideStepper: {
			name: "Hide Stepper",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
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
		isInvalid: {
			name: "Invalid",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
		isFocused: {
			name: "Show Focus",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
		isKeyboardFocused: {
			name: "Show keyboard focus",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
	},
	args: {
		rootClass: "spectrum-Stepper",
		isQuiet: false,
		isFocused: false,
		isKeyboardFocused: false,
		isInvalid: false,
		isDisabled: false,
	},
	parameters: {
		actions: {
			handles: [],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("stepper")
				? "migrated"
				: undefined,
		},
	},
};

export const Default = Template.bind({});
Default.args = {};

export const HideStepper = Template.bind({});
HideStepper.args = {
	hideStepper: true,
};

export const Quiet = Template.bind({});
Quiet.args = {
	Quiet: true,
};

export const isDisabled = Template.bind({});
isDisabled.args = {
	isDisabled: true,
};

export const isFocused = Template.bind({});
isFocused.args = {
	isFocused: true,
};

export const isKeyboardFocused = Template.bind({});
isKeyboardFocused.args = {
	isKeyboardFocused: true,
};

export const isInvalid = Template.bind({});
isInvalid.args = {
	isInvalid: true,
};

export const HighContrast = Default;
HighContrast.parameters = {
	chromatic: { forcedColors: "active" },
};
