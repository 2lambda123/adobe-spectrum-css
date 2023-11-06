import { useGlobals } from "@storybook/client-api";
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";

import "../index.css";

export const Template = ({
	rootClass = "spectrum-Tray",
	isOpen = true,
	content = [],
	customClasses = ["spectrum-Modal"],
	id,
	testId,
}) => {
	const [{ express }] = useGlobals();

	try {
		if (!express) import(/* webpackPrefetch: true */ "../themes/spectrum.css");
		else import(/* webpackPrefetch: true */ "../themes/express.css");
	} catch (e) {
		console.warn(e);
	}

	return html`
		<div class="${rootClass}-wrapper">
			<div
				class=${classMap({
					[rootClass]: true,
					"is-open": isOpen,
					...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
				})}
				id=${ifDefined(id)}
				data-testid=${ifDefined(testId)}
			>
			${content.map((c) => (typeof c === "function" ? c({}) : c))}
			</div>
		</div>
	`;
};
