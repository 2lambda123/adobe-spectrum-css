import { useArgs, useGlobals } from "@storybook/client-api";
import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { Template as FieldLabel } from "@spectrum-css/fieldlabel/stories/template.js";
import { Template as HelpText } from "@spectrum-css/helptext/stories/template.js";
import { Template as Icon } from "@spectrum-css/icon/stories/template.js";
import { Template as Popover } from "@spectrum-css/popover/stories/template.js";
import { Template as ProgressCircle } from "@spectrum-css/progresscircle/stories/template.js";

import "../index.css";

export const Picker = ({
	rootClass = "spectrum-Picker",
	size = "m",
	labelPosition,
	placeholder,
	isQuiet = false,
	isFocused = false,
	isOpen = false,
	isInvalid = false,
	isLoading = false,
	isDisabled = false,
	isReadOnly = false,
	customClasses = [],
	customStyles = {},
	content = [],
	iconName,
	id,

}) => {
	const [_, updateArgs] = useArgs();
	const [{ express }] = useGlobals();
	try {
		if (!express) import(/* webpackPrefetch: true */ "../themes/spectrum.css");
		else import(/* webpackPrefetch: true */ "../themes/express.css");
	} catch (e) {
		console.warn(e);
	}

	return html`
	<button
			class=${classMap({
				[rootClass]: true,
				[`${rootClass}--size${size?.toUpperCase()}`]:
					typeof size !== "undefined",
				[`${rootClass}--quiet`]: isQuiet,
				[`${rootClass}--sideLabel`]: labelPosition != "top",
				[`is-invalid`]: isInvalid,
				[`is-open`]: isOpen,
				[`is-loading`]: isLoading,
				[`is-focused`]: isFocused,
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			?disabled=${isDisabled}
			aria-haspopup="listbox"
			style=${ifDefined(styleMap(customStyles))}
			type="button"
			@click=${(e) => {
				updateArgs({ isOpen: !isOpen });
			}}
		>
			<span class="${rootClass}-label is-placeholder">${placeholder}</span>
			${isLoading
				? ProgressCircle({
						size: "s",
						isIndeterminate: true,
				  })
				: ""}
			${isInvalid && !isLoading
				? Icon({

						size,
						iconName: "Alert",
						customClasses: [`${rootClass}-validationIcon`],
				  })
				: ""}
			${Icon({

				size,
				iconName: "ChevronDown",
				customClasses: [`${rootClass}-menuIcon`],
			})}
		</button>
	`;
}

export const Template = ({
	rootClass = "spectrum-Picker",
	size = "m",
	label,
	labelPosition = "top",
	placeholder,
	helpText,
	isQuiet = false,
	isFocused = false,
	isOpen = false,
	isInvalid = false,
	isLoading = false,
	isDisabled = false,
	isReadOnly = false,
	customClasses = [],
	customStyles = {},
	customPopoverStyles = {},
	content = [],
	id,

}) => {
	let iconName = "ChevronDown200";
	switch (size) {
		case "s":
			iconName = "ChevronDown75";
			break;
		case "m":
			iconName = "ChevronDown100";
			break;
		case "xl":
			iconName = "ChevronDown300";
			break;
		default:
			iconName = "ChevronDown200";
	}

	return html`
		${label
			? FieldLabel({

					size,
					label,
					isDisabled,
					alignment: labelPosition,
			  })
			: ""}
		${labelPosition == "left" ?
			html`<div style="display: inline-block">
				${Picker({

					rootClass,
					size,
					placeholder,
					isQuiet,
					isFocused,
					isOpen,
					isInvalid,
					isLoading,
					isDisabled,
					isReadOnly,
					customClasses,
					customStyles,
					content,
					iconName,
					labelPosition,
					id,
				})}
			</div>
			`
		:
			Picker({

				rootClass,
				size,
				placeholder,
				isQuiet,
				isFocused,
				isOpen,
				isInvalid,
				isLoading,
				isDisabled,
				isReadOnly,
				customClasses,
				customStyles,
				content,
				iconName,
				labelPosition,
				id,
			})
		}

		${helpText
			? HelpText({
					text: helpText,
					variant: isInvalid ? "negative" : "neutral",
					hideIcon: true,
			  })
			: ""}
		${Popover({

			isOpen: isOpen && !isDisabled,
			withTip: false,
			position: "bottom",
			isQuiet,
			customStyles: customPopoverStyles,
			content,
		})}
	`;
};
