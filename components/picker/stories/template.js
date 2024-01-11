import { useArgs } from "@storybook/client-api";

import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";

import { Template as FieldLabel } from "@spectrum-css/fieldlabel/stories/template.js";
import { Template as HelpText } from "@spectrum-css/helptext/stories/template.js";
import { Template as Icon } from "@spectrum-css/icon/stories/template.js";
import { Template as Popover } from "@spectrum-css/popover/stories/template.js";
import { Template as ProgressCircle } from "@spectrum-css/progresscircle/stories/template.js";

import "../index.css";

export const Picker = ({
	rootClass = "spectrum-Picker",
	size = "m",
	label,
	labelPosition = "top",
	placeholder,
	helpText,
	isQuiet = false,
	isKeyboardFocused = false,
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
	...globals
}) => {
	const [_, updateArgs] = useArgs();
	return html`
		${when(label, () => FieldLabel({
			...globals,
			size,
			label,
			isDisabled,
			alignment: labelPosition,
		}))}
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
				[`is-keyboardFocused`]: isKeyboardFocused,
				...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
			})}
			?disabled=${isDisabled}
			aria-haspopup="listbox"
			style=${ifDefined(styleMap(customStyles))}
			type="button"
			@click=${() => {
				updateArgs({ isOpen: !isOpen });
			}}
		>
			${when(placeholder, () => html`<span class="${rootClass}-label is-placeholder">${placeholder}</span>`)}
			${when(isLoading, () => ProgressCircle({
				size: "s",
				isIndeterminate: true,
			}))}
			${when(isInvalid && !isLoading, () => Icon({
				...globals,
				size,
				iconName: "Alert",
				customClasses: [`${rootClass}-validationIcon`],
			}))}
			${Icon({
				...globals,
				size,
				uiIconName: "ChevronDown",
				customClasses: [`${rootClass}-menuIcon`],
			})}
		</button>`;
};

export const Template = ({
	rootClass = "spectrum-Picker",
	size = "m",
	label,
	labelPosition = "top",
	placeholder,
	helpText,
	isQuiet = false,
	isKeyboardFocused = false,
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
	...globals
}) => {
	return html`
		${when(label, () => FieldLabel({
			...globals,
			size,
			label,
			isDisabled,
			alignment: labelPosition,
		}))}
		${when(labelPosition == "left", () => html`
			<div style="display: inline-block">
				${Picker({
					...globals,
					rootClass,
					size,
					placeholder,
					isQuiet,
					isKeyboardFocused,
					isOpen,
					isInvalid,
					isLoading,
					isDisabled,
					isReadOnly,
					customClasses,
					customStyles,
					content,
					iconName: "ChevronDown",
					labelPosition,
					id,
				})}
			</div>
		`, () => Picker({
				...globals,
				rootClass,
				size,
				placeholder,
				isQuiet,
				isKeyboardFocused,
				isOpen,
				isInvalid,
				isLoading,
				isDisabled,
				isReadOnly,
				customClasses,
				customStyles,
				content,
				iconName: "ChevronDown",
				labelPosition,
				id,
		}))}
		${when(helpText, () => HelpText({
			text: helpText,
			variant: isInvalid ? "negative" : "neutral",
			hideIcon: true,
		}))}
		${Popover({
			...globals,
			isOpen: isOpen && !isDisabled,
			withTip: false,
			position: "bottom",
			isQuiet,
			customStyles: customPopoverStyles,
			content,
		})}
	`;
};
