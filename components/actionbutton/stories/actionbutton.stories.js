import isChromatic from "chromatic/isChromatic";

import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

import { Template } from "./template";

import { default as IconStories } from "@spectrum-css/icon/stories/icon.stories.js";
import { Template as Typography } from "@spectrum-css/typography/stories/template.js";

export default {
	title: "Components/Action button",
	description:
		"The action button component represents an action a user can take.",
	component: "ActionButton",
	argTypes: {
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
		iconName: {
			...(IconStories?.argTypes?.iconName ?? {}),
			if: false,
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
		isQuiet: {
			name: "Quiet styling",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
			},
			control: "boolean",
		},
		isEmphasized: {
			name: "Emphasized styling",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Component",
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
		isSelected: {
			name: "Selected",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
		isHovered: {
			name: "Hovered",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
		isFocused: {
			name: "Focused",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
		isActive: {
			name: "Active",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "State",
			},
			control: "boolean",
		},
		hideLabel: {
			name: "Hide label",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Advanced",
			},
			control: "boolean",
		},
		hasPopup: {
			name: "Has popup",
			description: "True if the button triggers a popup action.",
			type: { name: "boolean" },
			table: {
				type: { summary: "boolean" },
				category: "Advanced",
			},
			control: "boolean",
		},
		staticColor: {
			name: "StaticColor",
			type: { name: "string" },
			table: {
				type: { summary: "string" },
				category: "Advanced",
			},
			options: ["white", "black"],
			control: "select",
		},
	},
	args: {
		rootClass: "spectrum-ActionButton",
		size: "m",
		iconName: "More",
		isQuiet: false,
		isEmphasized: false,
		hasPopup: false,
		customStorybookStyles: {
			display: "flex",
			flexDirection: "row",
			flexWrap: "wrap",
			gap: "2rem"
		}
	},
	parameters: {
		actions: {
			handles: ["click .spectrum-ActionButton:not([disabled])"],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("actionbutton")
				? "migrated"
				: "legacy",
		},
	},
};

const ActionButtons = (args) => html`
	<div style=${styleMap({
		display: "flex",
		gap: "1rem",
	})}>
		${Template({
			...args,
			label: "More",
			iconName: undefined,
		})}
		${Template({
			...args,
			label: "More",
		})}
		${Template(args)}
		${Template({
			...args,
			hasPopup: true,
		})}
		${Template({
			...args,
			label: "More and this text should truncate",
			customStyles: { maxInlineSize: "100px" },
		})}
	</div>`;

const States = (args) => html`
	<div style=${styleMap({
		display: "flex",
		flexDirection: "column",
		gap: ".3rem",
	})}>
		${ActionButtons({
			...args
		})}
		<div>
			${Typography({
				semantics: "heading",
				size: "xxs",
				content: ["Selected"],
			})}
			${ActionButtons({
				...args,
				isSelected: true
			})}
		</div>
		<div>
			${Typography({
				semantics: "heading",
				size: "xxs",
				content: ["Focused"],
			})}
			${ActionButtons({
				...args,
				isFocused: true
			})}
		</div>
		<div>
			${Typography({
				semantics: "heading",
				size: "xxs",
				content: ["Hovered"],
			})}
			${ActionButtons({
				...args,
				isHovered: true
			})}
		</div>
		<div>
			${Typography({
				semantics: "heading",
				size: "xxs",
				content: ["Active"],
			})}
			${ActionButtons({
				...args,
				isActive: true
			})}
		</div>
		<div>
			${Typography({
				semantics: "heading",
				size: "xxs",
				content: ["Disabled"],
			})}
			${ActionButtons({
				...args,
				isDisabled: true
			})}
		</div>
		<div>
			${Typography({
				semantics: "heading",
				size: "xxs",
				content: ["Disabled + selected"],
			})}
			${ActionButtons({
				...args,
			isSelected: true,
			isDisabled: true
			})}
		</div>
	</div>`;

const Sizes = (args) => html`
	${isChromatic() ? html`
		${["s", "m", "l", "xl"].map((size) => {
			return Template({
				...args,
				size,
			});
		})}` : Template(args)}`;

const Variants = (args) => html`
	${isChromatic() ? States(args) : html`
		<div class="spectrum-Typography">
			${Typography({
				semantics: "heading",
				size: "s",
				content: ["Standard"],
			})}
			${States(args)}
		</div>
		<div class="spectrum-Typography">
			${Typography({
				semantics: "heading",
				size: "s",
				content: ["Emphasized"],
			})}
			${States({
				...args,
				isEmphasized: true,
			})}
		</div>
		<div class="spectrum-Typography">
			${Typography({
				semantics: "heading",
				size: "s",
				content: ["Quiet"],
			})}
			${States({
				...args,
				isQuiet: true,
			})}
		</div>
		<div class="spectrum-Typography">
			${Typography({
				semantics: "heading",
				size: "s",
				content: ["Sizing"],
			})}
			${Sizes(args)}
		</div>`
	}`;

export const Default = Variants.bind({});
Default.args = {};

export const StaticBlack = Variants.bind({});
StaticBlack.args = {
	staticColor: "black",
};

export const StaticWhite = Variants.bind({});
StaticWhite.args = {
	staticColor: "white",
};
