import { Template } from "./template";

export default {
	title: "Components/Color loupe",
	description:
		"The Color loupe component shows the output color that would otherwise be covered by a cursor, stylus, or finger during color selection.",
	component: "Colorloupe",
	argTypes: {
		/* No theme styles for express available */
		express: { table: { disable: true } },
		isOpen: {
			description: "Apply `is-open` to display the component",
			defaultValue: true,
			name: "Open",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
	},
	args: {
		rootClass: "spectrum-ColorLoupe",
    isOpen: true,
	},
	parameters: {
		chromatic: { diffThreshold: 0.2 },
		actions: {
			handles: [],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("colorloupe")
				? "migrated"
				: "legacy",
		},
	},
};

export const Default = Template.bind({});
Default.args = {};
