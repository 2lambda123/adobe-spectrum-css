import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

// Import the component markup template
import { Template } from "./template.js";
import { Template as Thumbnail } from "@spectrum-css/thumbnail/stories/template.js";

import path from "path";

// Imports an array of all icon names in the workflow set
import iconOpts from "@adobe/spectrum-css-workflow-icons";

const workflowIcons = (iconOpts || []).map((icon) =>
	path.basename(icon, ".svg")
);

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
			options: [
				"Arrow",
				"Asterisk",
				"Checkmark",
				"Chevron",
				"CornerTriangle",
				"Cross",
				"Dash",
				"SingleGripper",
				"DoubleGripper",
				"TripleGripper",
			],
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
Default.args = {};

export const UIIcons = (args) => html`
	<div
		style=${styleMap({
			display: "grid",
			gap: "var(--spectrum-spacing-100, 1em)",
			gridTemplateColumns:
				"repeat(auto-fill, var(--spectrum-thumbnail-size-500))",
			gridTemplateRows: "auto",
		})}
	>
		${[
			"Arrow",
			"Asterisk",
			"Checkmark",
			"Chevron",
			"CornerTriangle",
			"Cross",
			"Dash",
			"SingleGripper",
			"DoubleGripper",
			"TripleGripper",
		].map((iconName) => {
			const svg = Template({ ...args, iconName: iconName, setName: "ui" });
			return Thumbnail({
				svg,
				onclick: (e) => {
					e.preventDefault();
					e.stopPropagation();

					// Copy SVG to clipboard
					navigator.clipboard.writeText(svg);
				},
			});
		})}
	</div>
`;

UIIcons.args = {
	rootClass: "spectrum-Icon",
	setName: "ui",
	size: "xl",
};

UIIcons.argTypes = {
	setName: { table: { disable: true } },
	iconName: { table: { disable: true } },
	uiIconName: { table: { disable: true } },
};

export const WorkflowIcons = (args) => html`
	<div
		style=${styleMap({
			display: "grid",
			gap: "var(--spectrum-spacing-100, 1em)",
			gridTemplateColumns:
				"repeat(auto-fill, var(--spectrum-thumbnail-size-500))",
			gridTemplateRows: "auto",
		})}
	>
		${workflowIcons.map((iconName) => {
			const svg = Template({ ...args, iconName: iconName, setName: "ui" });
			return Thumbnail({
				svg,
				altText: iconName,
				backgroundColor: "var(--spectrum-gray-100)",
				onclick: (e) => {
					e.preventDefault();
					e.stopPropagation();

					// Copy SVG to clipboard
					navigator.clipboard.writeText(svg);
				},
			});
		})}
	</div>
`;

WorkflowIcons.args = {
	rootClass: "spectrum-Icon",
	setName: "workflow",
	size: "xl",
};

WorkflowIcons.argTypes = {
	setName: { table: { disable: true } },
	iconName: { table: { disable: true } },
	uiIconName: { table: { disable: true } },
};

export const HighContrast = Default;
HighContrast.parameters = {
	chromatic: { forcedColors: "active" },
};
