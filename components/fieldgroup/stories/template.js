import { useGlobals } from '@storybook/client-api';
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";

import { Template as FieldLabel } from "@spectrum-css/fieldlabel/stories/template.js";
import { Template as HelpText } from "@spectrum-css/helptext/stories/template.js";
import { Template as Radio } from "@spectrum-css/radio/stories/template.js";

import "../index.css";

export const Template = ({
	rootClass = "spectrum-FieldGroup",
	customClasses = [],
	layout,
	labelPosition,
	isInvalid,
	items,

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
				[`${rootClass}--${labelPosition}label`]:
					typeof labelPosition !== "undefined",
				[`${rootClass}--${layout}`]: typeof layout !== "undefined",
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
		>
			${FieldLabel({

				size: "m",
				label: "Field Group Label",
				alignment: labelPosition === "side" ? "right" : "top",
			})}

			<div class="${rootClass}InputLayout">
				${repeat(
					items,
					(item) => item.id,
					(item) => {
						return Radio({

							...item,
							customClasses: [`${rootClass}-item`],
						});
					}
				)}
				${HelpText({

					size: "m",
					text: "Select an option",
					variant: isInvalid ? "negative" : "neutral",
				})}
			</div>
		</div>
	`;
};
