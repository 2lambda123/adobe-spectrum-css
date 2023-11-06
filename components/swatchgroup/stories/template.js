import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { Template as Swatch } from "@spectrum-css/swatch/stories/template.js";

import "../index.css";

export const Template = ({
	rootClass = "spectrum-SwatchGroup",
	customClasses = [],
	size = "m",
	density = "regular",
	items = [],
	customStyles = {},
	id,
	testId,
	...swatchSettings
}) => html`
	<div
		class=${classMap({
			[rootClass]: true,
			[`${rootClass}--${density}`]:
				typeof density !== "undefined" && density !== "regular",
			...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
		})}
		style=${styleMap({
			...customStyles,
			inlineSize: `calc(5 * (var(--spectrum-swatch-size-${size === "xs" ? "extra-small" : size === "s" ? "small" : size === "l" ? "large" : "medium"}) + var(--spectrum-swatchgroup-spacing-${density})))`,
		})}
		id=${ifDefined(id)}
		data-testid=${ifDefined(testId)}
	>
		${items.map((swatch) => Swatch({
			...swatchSettings,
			size,
			...swatch,
		}))}
	</div>
`;
