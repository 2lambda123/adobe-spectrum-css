import { html, svg } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";

import { useArgs } from "@storybook/client-api";

import "../index.css";

export const Template = ({
	rootClass = "spectrum-Popover",
	size = "m",
	isOpen = false,
	withTip = false,
	position = "top",
	customClasses = [],
	id,
	customStyles = {},
	trigger,
	content = [],
	testId,
	...globals
}) => {
	const [, updateArgs] = useArgs();

	if (content.length === 0) {
		console.warn("Popover: No content provided.");
		return html``;
	}

	const { express } = globals;

	try {
		if (!express) import(/* webpackPrefetch: true */ "../themes/spectrum.css");
		else import(/* webpackPrefetch: true */ "../themes/express.css");
	} catch (e) {
		console.warn(e);
	}

	return html`
		${when(typeof trigger === "function", () => trigger({
			...globals,
			isSelected: isOpen,
			id: `trigger`,
			onclick: () => {
				// No trigger? Nothing to do.
				if (!trigger || !position) return [];

				const element = document.querySelector(`#trigger`);
				if (!element) return [];

				const rect = element.getBoundingClientRect();
				const popover = document.querySelector(`.${rootClass}`);
				if (!popover) return [];

				const transforms = [];

				position.split("-")?.forEach((item) => {
					const triggerXCenter = (rect.left + rect.right) / 2;
					const triggerYCenter = (rect.top + rect.bottom) / 2;
					const popWidth = popover.offsetWidth ?? 0;
					const popHeight = popover.offsetHeight ?? 0;
					let x, y;
					if (item === "top" || item === "bottom") {
						x = triggerXCenter - (popWidth > 0 ? popWidth / 2 : popWidth);
					} else if (item === "left" || item === "right") {
						y = triggerYCenter - (popHeight > 0 ? popHeight / 2 : popHeight);
					}

					if (item === "top") {
						y = rect.top - popHeight;
					} else if (item === "bottom") {
						y = rect.bottom;
					} else if (item === "left") {
						x = rect.left - popWidth;
					} else if (item === "right") {
						x = rect.right;
					}

					if (x) transforms.push(`translateX(${parseInt(x, 10)}px)`);
					if (y) transforms.push(`translateY(${parseInt(y, 10)}px)`);
				});
				updateArgs({
					isOpen: !isOpen,
					customStyles: {
						transform: transforms.join(" "),
					}
				});
			}
		}))}

		<div
			class=${classMap({
				[rootClass]: true,
				"is-open": isOpen,
				[`${rootClass}--size${size?.toUpperCase()}`]:
					typeof size !== "undefined",
				[`${rootClass}--withTip`]: withTip,
				[`${rootClass}--${position}`]: typeof position !== "undefined",
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			style=${ifDefined(styleMap(customStyles))}
			role="presentation"
			id=${ifDefined(id)}
			data-testid=${ifDefined(testId)}
		>
			${content.map((c) => (typeof c === "function" ? c({}) : c))}
			${withTip
				? position && ["top", "bottom"].some((e) => position.startsWith(e))
					? svg`<svg class="${rootClass}-tip" viewBox="0 -0.5 16 9" width="10"><path class="${rootClass}-tip-triangle" d="M-1,-1 8,8 17,-1"></svg>`
					: svg`<svg class="${rootClass}-tip" viewBox="0 -0.5 9 16" width="10"><path class="${rootClass}-tip-triangle" d="M-1,-1 8,8 -1,17"></svg>`
				: ""}
		</div>
	`;
};
