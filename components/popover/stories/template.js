import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";

import { useArgs } from "@storybook/client-api";

import "@spectrum-css/popover";

export function determinePosition(triggerEl, popoverEl) {
	if (!popoverEl || !triggerEl) return {};

	const rect = triggerEl.getBoundingClientRect();
	if (!rect) return {};

	return {
		["--spectrum-popover-width"]: `${popoverEl.offsetWidth ?? 0}px`,
		["--spectrum-popover-height"]: `${popoverEl.offsetHeight ?? 0}px`,
		["--spectrum-popover-trigger-inline-center"]: `${
			(rect.width ?? 0) / 2 + rect.left
		}px`,
		["--spectrum-popover-trigger-block-center"]: `${
			rect.top + (rect.height ?? 0) / 2
		}px`,
	};
}

export const Template = ({
	rootClass = "spectrum-Popover",
	size = "m",
	isOpen = false,
	withTip = false,
	position = "top",
	id = "popover-1",
	customClasses = [],
	customStyles,
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

	const triggerClick = (event) => {
		// No trigger? Nothing to do.
		if (!id || !event || !event.target) return;

		setTimeout(() => {
			const additionalStyles = determinePosition(
				event.target,
				document.querySelector(`#${id}`)
			);

			console.log(additionalStyles);

			updateArgs({
				isOpen: !isOpen,
				customStyles: {
					...customStyles,
					...additionalStyles,
				},
			});
		}, 0);
	};

	return html`
		${when(typeof trigger === "function", () =>
			trigger({
				...globals,
				id: "trigger",
				isSelected: isOpen,
				onclick: triggerClick,
			})
		)}

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
			style=${ifDefined(
				styleMap({
					[`--${rootClass.toLowerCase()}-inline-offset`]: "8px",
					[`--${rootClass.toLowerCase()}-block-offset`]: "8px",
					...customStyles,
				})
			)}
			role="presentation"
			id=${ifDefined(id)}
			data-testid=${ifDefined(testId)}
		>
			${content.map((c) => (typeof c === "function" ? c(globals) : c))}
			${when(
				withTip,
				["top", "bottom"].some((e) => position.startsWith(e))
					? html`<svg class="${rootClass}-tip" viewBox="0 -0.5 16 9" width="10"><path class="${rootClass}-tip-triangle" d="M-1,-1 8,8 17,-1"></svg>`
					: html`<svg class="${rootClass}-tip" viewBox="0 -0.5 9 16" width="10"><path class="${rootClass}-tip-triangle" d="M-1,-1 8,8 -1,17"></svg>`
			)}
		</div>
	`;
};
