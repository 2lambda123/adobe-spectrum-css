import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import "@spectrum-css/icon";
import path from "path";

// Imports an array of all icon names in the workflow set
import iconOpts from "@adobe/spectrum-css-workflow-icons";

export const workflowIcons = (iconOpts || []).map((icon) =>
	path.basename(icon, ".svg")
);

const uiIcons = [
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
];

/**
 * @typedef { keyof import("./icon.stories.js").default.args } IconArgs
 * @typedef { IconArgs & { scale: string, useRef: boolean, setName: 'workflow' | 'ui' } } IconProps
 */

/**
 * Template for rendering an icon
 * @description Icon template that renders an icon based on the provided icon name and set name.
 * @param {IconProps} props
 * @param {string} props.rootClass
 * @param {"s"|"m"|"l"|"xl"} props.size
 * @param {"ui"|"workflow"} props.setName
 * @param {string} props.iconName - Icon name with or without the icon scale number appended. Names with the scale (e.g. 75, 100) will replace it based upon the value of 'size'.
 * @param {string} props.fill
 * @param {string} props.id
 * @param {string[]} props.customClasses
 * @param {boolean} props.useRef
 * @returns {import('lit').TemplateResult<1>}
 */
export const Template = ({
	rootClass = "spectrum-Icon",
	size = "m",
	setName,
	iconName,
	fill,
	id,
	customClasses = [],
	useRef = false,
	style,
	...globals
}) => {
	const { scale } = globals;

	if (!iconName) {
		console.warn(
			"Icon: Could not render a result because no icon name was provided to the icon template."
		);
		return html``;
	}

	let idKey = iconName;

	// If a descriptor like Right, Left, Down, or Up is present for the Chevron or the
	// Arrow, use that only for the class and not the icon fetch.
	if (
		(!setName || setName === "ui") &&
		uiIcons.some((c) => idKey.startsWith(c)) &&
		["Right", "Left", "Down", "Up"].some((c) => idKey.includes(c))
	) {
		idKey = idKey.replace(/(Right|Left|Down|Up)/, "");
		if (!setName) setName = "ui";
	}

	// If the icon name includes its scale, reformat it to match the provided sizing.
	// E.g. with a size of "s", the icon name "Checkmark100" would become "Checkmark75".
	if (
		idKey.match(/^(?!\d).*\d{2,3}$/) &&
		// uiIcons.includes(idKey.replace(/\d{2,3}$/, "")) &&
		!idKey.endsWith("Gripper")
	) {
		let sizeVal;
		switch (size) {
			case "xs":
			case "s":
				sizeVal = "75";
				break;
			case "l":
				sizeVal = "200";
				break;
			case "xl":
			case "xxl":
				sizeVal = "300";
				break;
			default:
				sizeVal = "100";
				break;
		}

		idKey = idKey.replace(/\d{2,3}$/, sizeVal);
		iconName = iconName.replace(/\d{2,3}$/, sizeVal);
	}

	if (!setName) {
		setName = workflowIcons.includes(idKey) ? "workflow" : "ui";
	}

	const isUI = setName === "ui";
	const isWorkflow = !isUI;

	// ui ID: #spectrum-css-icon-${idKey}
	// workflow ID: #spectrum-icon-(18|24)-${idKey}
	const iconID = isUI
		? `spectrum-css-icon-${idKey}`
		: `spectrum-icon-${scale !== "medium" ? `24` : `18`}-${idKey}`;

	return html` <svg
		class=${classMap({
			[rootClass]: true,
			[`spectrum-UIIcon-${iconName}`]: !!isUI,
			[`${rootClass}--${scale}`]: !!(isUI && scale),
			[`${rootClass}--size${size?.toUpperCase()}`]: !!(isWorkflow && size),
			...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
		})}
		id=${ifDefined(id)}
		style=${styleMap({
			color: fill ? "fill" : "inherit",
			...style,
		})}
		focusable="false"
		aria-hidden="true"
		aria-labelledby=${idKey}
		role="img"
	>
		<title id=${idKey}>${idKey.replace(/([A-Z])/g, " $1").trim()}</title>
		<use xlink:href="#${iconID}" href="#${iconID}" />
	</svg>`;
};
