import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";

import { useArgs } from "@storybook/client-api";

import "@spectrum-css/thumbnail";

export const Template = ({
	rootClass = "spectrum-Thumbnail",
	size = "500",
	customClasses = [],
	imageURL,
	svg,
	altText,
	isCover,
	isDisabled,
	onclick,
	id,
	isLayer,
	isSelected,
	isFocused,
	backgroundColor,
	styles,
	// ...globals
}) => {
	const [_, updateArgs] = useArgs();

	if (!imageURL && !svg) {
		console.warn(
			"Thumbnail: Could not render a result because no image or SVG asset was provided."
		);
		return html``;
	}

	const imageMarkup = svg
		? html`${svg}`
		: html`<img class="${rootClass}-image" src=${imageURL} alt=${altText} />`;

	return html`
		<div
			class=${classMap({
				[rootClass]: true,
				[`${rootClass}--cover`]: isCover,
				[`${rootClass}-layer`]: isLayer,
				[`is-selected`]: isSelected,
				[`is-focused`]: isFocused,
				[`is-disabled`]: isDisabled,
				[`${rootClass}--size${size}`]: typeof size !== "undefined",
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			id=${ifDefined(id)}
			@click=${onclick}
			@focusin=${() => {
				updateArgs({ isFocused: true });
			}}
			@focusout=${() => {
				updateArgs({ isFocused: false });
			}}
		>
			${when(
				isLayer,
				html`<div class="${rootClass}-layer-inner">${imageMarkup}</div>`
			)}
			${when(
				backgroundColor,
				html`
					<div
						class="${rootClass}-background"
						style=${styleMap({
							"background-color": backgroundColor,
							...styles,
						})}
					></div>
				`
			)}
			<div class="${rootClass}-image-wrapper">${imageMarkup}</div>
		</div>
	`;
};
