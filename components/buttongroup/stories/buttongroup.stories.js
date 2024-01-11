import isChromatic from "chromatic/isChromatic";

import { html } from "lit";

import { Template } from "./template";

export default {
	title: "Components/Button group",
	component: "ButtonGroup",
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
		vertical: {
			name: "Vertical layout",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: "boolean",
		},
		items: { table: { disable: true } },
	},
	args: {
		rootClass: "spectrum-ButtonGroup",
		size: "m",
		iconName: undefined,
		vertical: false,
		items: [
			{
				variant: "secondary",
				treatment: "outline",
				label: "No, thanks",
			},
			{
				variant: "secondary",
				treatment: "outline",
				label: "Remind me later",

			},
			{
				variant: "primary",
				treatment: "fill",
				label: "Rate now",
			},
		],
	},
	parameters: {
		actions: {
			handles: [],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("buttongroup")
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
Default.args = {};

export const Vertical = Sizes.bind({});
Vertical.args = { vertical: true };
