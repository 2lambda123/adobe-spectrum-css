import { useGlobals } from "@storybook/client-api";
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { Template as Avatar } from "@spectrum-css/avatar/stories/template.js";
import { Template as ClearButton } from "@spectrum-css/clearbutton/stories/template.js";
import { Template as Icon } from "@spectrum-css/icon/stories/template.js";

import "../index.css";

// More on component templates: https://storybook.js.org/docs/web-components/writing-stories/introduction#using-args
export const Template = ({
	rootClass = "spectrum-Tag",
	size = "m",
	iconName,
	avatarUrl,
	label,
	isSelected = false,
	isEmphasized = false,
	isDisabled = false,
	isInvalid = false,
	hasClearButton = false,
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
		<div
			class=${classMap({
				[rootClass]: true,
				[`${rootClass}--size${size?.toUpperCase()}`]:
					typeof size !== "undefined",
				"is-emphasized": isEmphasized,
				"is-disabled": isDisabled,
				"is-invalid": isInvalid,
				"is-selected": isSelected,
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			id=${ifDefined(id)}
			data-testid=${ifDefined(testId)}
			tabindex=${isDisabled ? '-1' : '0'}
		>
			${avatarUrl
				? Avatar({

						image: avatarUrl,
						size: "50",
				  })
				: ""}
			${iconName
				? Icon({

						size,
						iconName,
						customClasses: [`${rootClass}-itemIcon`],
				  })
				: ""}
			<span class="${rootClass}-itemLabel">${label}</span>
			${hasClearButton
				? ClearButton({

						size,
						customClasses: [`${rootClass}-clearButton`],
						onclick: (evt) => {
							const el = evt.target;
							if (!el) return;

							const wrapper = el.closest(rootClass);
							wrapper.parentNode.removeChild(wrapper);
						},
				  })
				: ""}
		</div>
	`;
};
