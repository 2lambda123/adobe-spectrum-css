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

import "@spectrum-css/picker";

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
    customClasses = [],
    customStyles = {},
    iconName = "ChevronDown",
    id,
}) => {
    const [, updateArgs] = useArgs();

    return html`
        <button
            class=${classMap({
                [rootClass]: true,
                [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
                [`${rootClass}--quiet`]: isQuiet,
                [`${rootClass}--sideLabel`]: labelPosition != "top",
                [`is-invalid`]: isInvalid,
                [`is-open`]: isOpen,
                [`is-loading`]: isLoading,
                [`is-focused`]: isFocused,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
            ?disabled=${isDisabled}
            id=${ifDefined(id)}
            aria-haspopup="listbox"
            style=${ifDefined(styleMap(customStyles))}
            type="button"
            @click=${() => {
                updateArgs({ isOpen: !isOpen });
            }}
        >
            ${when(placeholder, () => html`<span class="${rootClass}-label is-placeholder">${placeholder}</span>`)}
            ${when(isLoading, () => ProgressCircle({ size: "s", isIndeterminate: true }))}
            ${when(isInvalid && !isLoading, () =>
                Icon({ size, iconName: "Alert", customClasses: [`${rootClass}-validationIcon`] }),
            )}
            ${Icon({ size, iconName, customClasses: [`${rootClass}-menuIcon`] })}
        </button>
    `;
};

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
    isReadOnly = false,
    isInvalid = false,
    isLoading = false,
    isDisabled = false,
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
        ${when(label, () => FieldLabel({ size, label, isDisabled, alignment: labelPosition }))}
        ${labelPosition == "left"
            ? html`<div style="display: inline-block">
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
              </div> `
            : Picker({
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
        ${when(helpText, () =>
            HelpText({
                text: helpText,
                variant: isInvalid ? "negative" : "neutral",
                hideIcon: true,
            }),
        )}
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
