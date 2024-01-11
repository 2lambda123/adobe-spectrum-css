import isChromatic from "chromatic/isChromatic";

import { html } from "lit";

import { Template } from "./template";

export default {
	title: "Components/Field label",
	description:
		"The Field label component is used along with inputs to display a label for that input.",
	component: "Fieldlabel",
	argTypes: {
		size: {
			name: "Size",
			type: { name: "string", required: true },
			table: {
				type: { summary: "string" },
				category: "Component",
			},
			options: ["s", "m", "l", "xl"],
			control: "select",
		},
		label: {
			name: "Label",
			type: { name: "string" },
			table: {
				type: { summary: "string" },
				category: "Content",
			},
			control: { type: "text" },
		},
		alignment: {
			name: "Alignment",
			type: { name: "string" },
			table: {
				type: { summary: "string" },
				category: "Component",
			},
			options: ["left", "right"],
			control: "select",
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
		isRequired: {
			name: "Required",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
	},
	args: {
		rootClass: "spectrum-FieldLabel",
		size: "m",
		alignment: "left",
		isDisabled: false,
		isRequired: false,
	},
	parameters: {
		actions: {
			handles: [],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("fieldlabel")
				? "migrated"
				: "legacy",
		},
	},
};

const Sizes = (args) => html`
	${isChromatic() ? html`
		${["s", "m", "l", "xl"].map((size) => {
			return Template({
				...args,
				size,
			});
		})}` : Template(args)}`;

export const Default = Sizes.bind({});
Default.args = {
	label: "Label",
};

export const RightAligned = Sizes.bind({});
RightAligned.args = {
	label: "Label",
	alignment: "right",
	style: { width: "72px" },
};

export const Required = Sizes.bind({});
Required.args = {
	label: "Label example",
	alignment: "left",
	isRequired: true,
	style: { width: "200px" },
};

export const WrappingAndRequired = Sizes.bind({});
WrappingAndRequired.args = {
	label: "Label example with longer text that will wrap to the next line. And with an asterisk that marks it as required.",
	alignment: "left",
	isRequired: true,
	style: { width: "200px" },
};
