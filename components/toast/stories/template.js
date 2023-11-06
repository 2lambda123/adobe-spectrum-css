import { useGlobals } from "@storybook/client-api";
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { Template as Button } from "@spectrum-css/button/stories/template.js";
import { Template as CloseButton } from "@spectrum-css/closebutton/stories/template.js";
import { Template as Icon } from "@spectrum-css/icon/stories/template.js";

import "../index.css";

// More on component templates: https://storybook.js.org/docs/web-components/writing-stories/introduction#using-args
export const Template = ({
	rootClass = "spectrum-Toast",
	message,
	inlineButtonLabel,
	width,
	variant,
	customClasses = [],
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

	const iconName =
		variant === "negative"
			? "Alert"
			: variant === "positive"
			? "CheckmarkCircle"
			: "Info";

	return html`
		<div
			class=${classMap({
				[rootClass]: true,
				[`${rootClass}--${variant}`]: typeof variant !== "undefined",
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			id=${ifDefined(id)}
			data-testid=${ifDefined(testId)}
		>
			${variant
				? Icon({
						iconName: ifDefined(iconName),
						size: "m",
						customClasses: [`${rootClass}-typeIcon`],
				  })
				: ""}
			<div class="${rootClass}-body">
				<div class="${rootClass}-content">${message}</div>
				${inlineButtonLabel
					? Button({
							variant: "secondary",
							size: "m",
							staticColor: "white",
							treatment: "outline",
							label: inlineButtonLabel,
					  })
					: ""}
			</div>
			<div class="${rootClass}-buttons">
				${CloseButton({
					size: "m",
					staticColor: "white",
					onclick,
				})}
			</div>
		</div>
	`;
};
