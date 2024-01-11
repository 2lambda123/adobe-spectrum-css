import isChromatic from "chromatic/isChromatic";

import { html } from "lit";

import { Template } from "./template";

import { default as ActionButton } from "@spectrum-css/actionbutton/stories/actionbutton.stories.js";

export default {
	title: "Components/Action group",
	description: "The Action group component is a collection of action buttons.",
	component: "ActionGroup",
	argTypes: {
		areQuiet: ActionButton.argTypes.isQuiet,
		areEmphasized: ActionButton.argTypes.isEmphasized,
		staticColors: ActionButton.argTypes.staticColor,
		content: { table: { disable: true } },
		size: {
			name: "Size",
			type: { name: "string", required: true },
			table: {
				type: { summary: "string" },
				category: "Component",
			},
			options: ["xs", "s", "m", "l", "xl"],
			control: "select",
		},
		vertical: {
			name: "Vertical layout",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: "boolean",
		},
		compact: {
			name: "Compact layout",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: "boolean",
		},
		justified: {
			name: "Justified",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Advanced",
			},
			control: "boolean",
		},
	},
	args: {
		rootClass: "spectrum-ActionGroup",
		size: "m",
		areQuiet: ActionButton.args.isQuiet,
		areEmphasized: ActionButton.args.isEmphasized,
		staticColors: ActionButton.args.staticColor,
		vertical: false,
		compact: false,
		justified: false,
		content: [
			{
				iconName: "Edit",
				label: "Edit",
			},
			{
				iconName: "Copy",
				label: "Copy",
			},
			{
				iconName: "Delete",
				label: "Delete",
				isSelected: true,
			},
		],
	},
	parameters: {
		actions: {
			handles: [...ActionButton.parameters.actions.handles],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("actiongroup")
				? "migrated"
				: "legacy",
		},
	},
};

const Sizes = (args) => html`
	${isChromatic() ? html`
		${["xs", "s", "m", "l", "xl"].map((size) => {
			return Template({
				...args,
				size,
			});
		})}` : Template(args)}`;

export const Default = Sizes.bind({});
Default.args = {};

export const Compact = Sizes.bind({});
Compact.args = {
	compact: true,
};

export const Vertical = Sizes.bind({});
Vertical.args = {
	vertical: true,
};

export const VerticalCompact = Sizes.bind({});
VerticalCompact.args = {
	vertical: true,
	compact: true,
};

export const Justified = Sizes.bind({});
Justified.args = {
	justified: true,
};

export const Quiet = Sizes.bind({});
Quiet.args = {
	areQuiet: true,
};
