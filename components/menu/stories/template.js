import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";

import { Template as Checkbox } from "@spectrum-css/checkbox/stories/template.js";
import { Template as Divider } from "@spectrum-css/divider/stories/template.js";
import { Template as Icon } from "@spectrum-css/icon/stories/template.js";
import { Template as Switch } from "@spectrum-css/switch/stories/template.js";

import "@spectrum-css/menu";

export const Template = ({
    rootClass = "spectrum-Menu",
    labelledby,
    customClasses = [],
    customStyles = {},
    size,
    isDisabled = false,
    selectionMode = "none",
    isOpen = false,
    hasActions = false,
    items = [],
    role = "menu",
    subrole = "menuitem",
    id,
}) => {
    return html`
        <ul
            class=${classMap({
                [rootClass]: true,
                [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
                "is-selectable": selectionMode === "single",
                "is-selectableMultiple": selectionMode === "multiple",
                "is-open": isOpen,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
            id=${ifDefined(id)}
            role=${ifDefined(role)}
            aria-labelledby=${ifDefined(labelledby)}
            aria-disabled=${isDisabled ? "true" : "false"}
            style=${ifDefined(styleMap(customStyles))}
        >
            ${items.map((i, idx) => {
                if (i.type === "divider")
                    return Divider({
                        tag: "li",
                        size: "s",
                        customClasses: [`${rootClass}-divider`],
                    });
                else if (i.heading) return MenuGroup({ ...i, subrole, size, selectionMode });
                else
                    return MenuItem({
                        ...i,
                        idx,
                        rootClass: `${rootClass}-item`,
                        role: subrole,
                        size,
                        selectionMode,
                        hasActions,
                    });
            })}
        </ul>
    `;
};

export const MenuItem = ({
    rootClass,
    label,
    description,
    iconName,
    isHighlighted = false,
    isActive = false,
    isSelected = false,
    isDisabled = false,
    isChecked = false,
    isFocused = false,
    isDrillIn = false,
    isCollapsible = false,
    isOpen = false,
    role = "menuitem",
    items = [],
    size,
    id,
    idx = 0,
    hasActions,
    selectionMode,
    value,
}) => {
    return html`
        <li
            class=${classMap({
                [`${rootClass}`]: true,
                "is-highlighted": isHighlighted,
                "is-active": isActive,
                "is-focused": isFocused,
                "is-selected": isSelected,
                "is-disabled": isDisabled,
                [`${rootClass}--drillIn`]: isDrillIn,
                [`${rootClass}--collapsible`]: isCollapsible,
                "is-open": isOpen,
            })}
            id=${ifDefined(id)}
            role=${ifDefined(role)}
            aria-selected=${isSelected ? "true" : "false"}
            aria-disabled=${isDisabled ? "true" : "false"}
            tabindex=${ifDefined(!isDisabled ? "0" : undefined)}
        >
            ${when(isCollapsible, () =>
                Icon({
                    iconName: "ChevronRight100",
                    size,
                    customClasses: [`${rootClass}Icon`, "spectrum-Menu-chevron"],
                }),
            )}
            ${when(iconName, () =>
                Icon({ iconName, size, customClasses: [`${rootClass}Icon`, `${rootClass}Icon--workflowIcon`] }),
            )})}
            ${when(isCollapsible, () => html`<span class="spectrum-Menu-sectionHeading">${label}</span>`)}
            ${when(
                selectionMode != "multiple" && !isCollapsible,
                () =>
                    html`<span
                        class=${classMap({
                            [`${rootClass}Label`]: true,
                            ["spectrum-Switch-label"]: hasActions,
                        })}
                    >
                        ${label}
                    </span>`,
            )}
            ${when(
                typeof description != "undefined",
                () => html`<span class="${rootClass}Description">${description}</span>`,
            )}
            ${when(isDrillIn, () =>
                Icon({
                    iconName: "ChevronRight100",
                    size,
                    customClasses: [`${rootClass}Icon`, "spectrum-Menu-chevron"],
                }),
            )}
            ${when(selectionMode == "multiple", () =>
                Checkbox({
                    size,
                    isEmphasized: true,
                    label: label,
                    id: `checkbox-${idx}`,
                    customClasses: [`${rootClass}Checkbox`],
                }),
            )}
            ${when(isChecked && selectionMode != "multiple", () =>
                Icon({
                    iconName: "Checkmark100",
                    size,
                    customClasses: [`${rootClass}Icon`, "spectrum-Menu-checkmark"],
                }),
            )}
            ${when(value, () => html`<span class="${rootClass}Value">${value}</span>`)}
            ${when(
                hasActions,
                () =>
                    html`<div class="${rootClass}Actions">
                        ${Switch({
                            size,
                            label: null,
                            id: `switch-${idx}`,
                            customClasses: [`${rootClass}Switch`],
                        })}
                    </div>`,
            )}
            ${when(isCollapsible && items.length > 0, () => Template({ items, isOpen, size }))}
        </li>
    `;
};

export const MenuGroup = ({
    heading,
    id,
    idx = 0,
    items = [],
    isDisabled = false,
    isSelectable = false,
    subrole,
    size,
}) => html`
    <li id=${ifDefined(id)} role="presentation">
        ${when(
            heading,
            () =>
                html`<span
                    class="spectrum-Menu-sectionHeading"
                    id=${id ?? `menu-heading-category-${idx}`}
                    aria-hidden="true"
                    >${heading}</span
                >`,
        )}
        ${Template({
            role: "group",
            subrole,
            labelledby: id,
            items,
            isDisabled,
            isSelectable,
            size,
        })}
    </li>
`;
