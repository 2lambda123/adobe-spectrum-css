import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

// Import the component markup template
import { Template } from "./template";

import { workflowIcons, uiIcons } from "./utilities.js";

export default {
	title: "Components/Icon",
	description:
		"The icons component contains all UI icons used for components as well as the CSS for UI and workflow icons.",
	component: "Icon",
	argTypes: {
		/* Turn off express theme for icon preview b/c they use a separate icon set */
		express: { table: { disable: true } },
		reducedMotion: { table: { disable: true } },
		size: {
			name: "Size",
			type: { name: "string", required: true },
			table: {
				type: { summary: "string" },
				category: "Component",
			},
			options: ["s", "m", "l", "xl", "xxl"],
			control: "select",
		},
		setName: {
			name: "Icon set",
			type: { name: "string", required: true },
			table: {
				type: { summary: "string" },
				category: "Content",
			},
			options: ["ui", "workflow"],
			control: "inline-radio",
		},
		iconName: {
			name: "Workflow icons",
			type: { name: "string" },
			table: {
				type: { summary: "string" },
				category: "Content",
			},
			options: workflowIcons,
			control: "select",
			if: { arg: "setName", eq: "workflow" },
		},
		uiIconName: {
			name: "UI icons",
			type: { name: "string" },
			table: {
				type: { summary: "string" },
				category: "Content",
			},
			options: uiIcons,
			control: "select",
			if: { arg: "setName", eq: "ui" },
		},
		fill: {
			name: "Fill color",
			type: { name: "string" },
			table: {
				type: { summary: "string" },
				category: "Advanced",
			},
			control: "color",
		},
		useRef: { table: { disable: true } },
	},
	args: {
		rootClass: "spectrum-Icon",
		setName: "workflow",
		iconName: "ABC",
		size: "xl",
	},
	parameters: {
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("icon")
				? "migrated"
				: undefined,
		},
	},
};

export const Default = (args) =>
	Template({
		...args,
		iconName: args.iconName ?? args.uiIconName,
		setName: args.setName ?? (args.uiIconName ? "ui" : "workflow"),
	});

export const UI = (args) => {
	return html`
		<div style=${styleMap({ display: "flex", flexWrap: "wrap", gap: "1em" })}>
			${uiIcons.map((iconName) =>
				Template({
					...args,
					useRef: true,
					iconName,
					setName: "ui",
				})
			)}
		</div>
	`;
};
UI.argTypes = {
	setName: { table: { disable: true } },
	iconName: { table: { disable: true } },
	uiIconName: { table: { disable: true } },
};

export const Workflow = (args) => {
	return html`
		<div style=${styleMap({ display: "flex", flexWrap: "wrap", gap: "1em" })}>
			${workflowIcons.map((iconName) =>
				Template({
					...args,
					useRef: true,
					iconName,
					setName: "workflow",
				})
			)}
		</div>
	`;
};
Workflow.argTypes = {
	setName: { table: { disable: true } },
	iconName: { table: { disable: true } },
	uiIconName: { table: { disable: true } },
};
