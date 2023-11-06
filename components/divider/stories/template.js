import { useGlobals } from '@storybook/client-api';
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";

import { capitalize, lowerCase, upperCase } from "lodash-es";

import "../index.css";

export const Template = ({
	rootClass = "spectrum-Divider",
	size = "m",
	tag = "hr",
	staticColor,
	vertical = false,
	customClasses = [],

}) => {
	const [{ express }] = useGlobals();

	try {
		if (!express) import(/* webpackPrefetch: true */ "../themes/spectrum.css");
		else import(/* webpackPrefetch: true */ "../themes/express.css");
	} catch (e) {
		console.warn(e);
	}

	if (tag === "hr") {
		return html`
    <hr
      class=${classMap({
				[rootClass]: true,
				[`${rootClass}--size${upperCase(size)}`]: typeof size !== "undefined",
				[`${rootClass}--vertical`]: vertical === true,
				[`${rootClass}--static${capitalize(lowerCase(staticColor))}`]:
					typeof staticColor !== "undefined",
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
      style=${
				vertical === true
					? "min-height: 20px; height: auto; align-self: stretch"
					: ""
			}
      role="separator"
      >
    </hr>`;
	} else {
		return html` <div
			class=${classMap({
				[rootClass]: true,
				[`${rootClass}--size${size?.toUpperCase()}`]:
					typeof size !== "undefined",
				[`${rootClass}--vertical`]: vertical === true,
				[`${rootClass}--static${capitalize(lowerCase(staticColor))}`]:
					typeof staticColor !== "undefined",
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			style=${vertical === true
				? "min-height: 20px; height: auto; align-self: stretch"
				: ""}
			role="separator"
		></div>`;
	}
};
