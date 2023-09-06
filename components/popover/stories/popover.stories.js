import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";

// Import the component markup template
import { Template } from "./template";

import { Template as ActionButton } from "@spectrum-css/actionbutton/stories/template.js";
import { Template as Menu } from "@spectrum-css/menu/stories/template.js";

const menuItems = [
	{
		iconName: "Edit",
		label: "Edit",
	},
	{
		iconName: "Copy",
		label: "Copy",
	},
	{
		iconName: "Move",
		label: "Move",
	},
	{
		iconName: "Delete",
		label: "Delete",
	},
];

export default {
	title: "Components/Popover",
	description:
		"A popover is used to display transient content (menus, options, additional actions etc.) and appears when clicking/tapping on a source (tools, buttons, etc.). It stands out via its visual style (stroke and drop shadow) and floats on top of the rest of the interface.",
	component: "Popover",
	argTypes: {
		trigger: { table: { disable: true } },
		triggerId: { table: { disable: true } },
		content: { table: { disable: true } },
		isOpen: {
			name: "Open",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: { type: "boolean" },
		},
		withTip: {
			name: "Show with tip",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: { type: "boolean" },
		},
		position: {
			name: "Positioning",
			type: { name: "string" },
			table: {
				type: { summary: "string" },
				category: "Component",
			},
			control: "select",
			options: [
				"top",
				"top-start",
				"top-end",
				"bottom",
				"bottom-start",
				"bottom-end",
				"left",
				"left-top",
				"left-bottom",
				"right",
				"right-top",
				"right-bottom",
			],
		},
	},
	args: {
		rootClass: "spectrum-Popover",
		isOpen: true,
		withTip: false,
		position: "top",
		id: "popover-1",
		trigger: ActionButton.bind(this, {
			size: "l",
			hasPopup: true,
			label: "Hop on pop(over)",
		}),
		content: [
			Menu.bind(this, {
				items: menuItems,
			}),
		],
	},
	parameters: {
		layout: "centered",
		actions: {
			handles: [],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("popover")
				? "migrated"
				: undefined,
		},
		chromatic: { delay: 2000 },
	},
	// provide padding so that Chromatic can capture the full focus indicator
	decorators: [
		(Story) =>
			html`<div
				style=${ifDefined(
					styleMap({
						"--spectrum-popover-offset": "8px",
						padding: "1em",
					})
				)}
			>
				${Story().outerHTML || Story()}
			</div>`,
	],
	// play: async ({ canvasElement }) => {
	// 	const canvas = within(canvasElement);
	// 	await userEvent.click(canvas.getAllByRole("button")?.[0]);
	// },
};

export const Default = Template.bind({});
Default.args = {};

export const WithTip = Template.bind({});
WithTip.args = { withTip: true };

export const Nested = Template.bind({});
Nested.args = {
	content: [
		Menu.bind(null, {
			items: [
				menuItems[0],
				{
					label: "Hop on pop(over) 2",
					isDrillIn: true,
					id: "trigger-2",
					onclick: (event) => {
						updateArgs({
							isOpen: !isOpen,
						});
					},
				},
			],
		}),
		Default.bind(null, {
			isOpen: true,
			position: "right",
			id: "popover-2",
			trigger: "trigger-2",
			content: [
				Menu.bind(null, {
					items: menuItems,
				}),
			],
		}),
	],
};
