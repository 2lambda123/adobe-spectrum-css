import { useGlobals } from '@storybook/client-api';
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { capitalize, lowerCase } from "lodash-es";

import "../index.css";

export const Template = ({
	rootClass = "spectrum-Link",
	size = "m",
	url = "#",
	text,
	variant,
	staticColor,
	isQuiet = false,
	id,
	customClasses = [],
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
		<a
			class=${classMap({
				[rootClass]: true,
				[`${rootClass}--quiet`]: isQuiet,
				[`${rootClass}--${variant}`]: typeof variant !== "undefined",
				[`${rootClass}--static${capitalize(lowerCase(staticColor))}`]:
					typeof staticColor !== "undefined",
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			id=${ifDefined(id)}
			data-testid=${ifDefined(testId)}
			href=${ifDefined(url)}
		>
			${text}
		</a>
	`;
};
