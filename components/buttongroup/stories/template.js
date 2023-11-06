import { useGlobals } from '@storybook/client-api';
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";

import { Template as Button } from "@spectrum-css/button/stories/template.js";

import "../index.css";

export const Template = ({
	rootClass = "spectrum-ButtonGroup",
	customClasses = [],
	size = "m",
	items = [],
	vertical = false,

}) => {
	const [{ express }] = useGlobals();

	try {
		if (!express) import(/* webpackPrefetch: true */ "../themes/spectrum.css");
		else import(/* webpackPrefetch: true */ "../themes/express.css");
	} catch (e) {
		console.warn(e);
	}

	return html`
		<div
			class=${classMap({
				[rootClass]: true,
				[`${rootClass}--size${size?.toUpperCase()}`]:
					typeof size !== "undefined",
				[`${rootClass}--vertical`]: vertical,
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
		>
			${items.map((item) =>
				Button({

					...item,
					size,
					customClasses: [`${rootClass}-item`],
				})
			)}
		</div>
	`;
};
