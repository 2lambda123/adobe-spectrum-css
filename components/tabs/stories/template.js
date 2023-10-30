import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";

import { Template as Icon } from "@spectrum-css/icon/stories/template.js";

import "@spectrum-css/tabs";

export const Template = ({
    rootClass = "spectrum-Tabs",
    customClasses = [],
    size = "m",
    orientation = "horizontal",
    isQuiet,
    isEmphasized,
    isCompact,
    items,
    selectorStyle = {},
    customStyles = {},
}) => {
    return html`
        <div
            class=${classMap({
                [rootClass]: true,
                [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
                [`${rootClass}--${orientation}`]: typeof orientation !== "undefined",
                [`${rootClass}--quiet`]: isQuiet,
                [`${rootClass}--emphasized`]: isEmphasized,
                [`${rootClass}--compact`]: isCompact,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
            style=${ifDefined(styleMap(customStyles))}
        >
            ${repeat(
                items,
                (item) => item.id,
                (item) => {
                    if (typeof item === "object") {
                        return html`
                            <div
                                class=${classMap({
                                    [`${rootClass}-item`]: true,
                                    "is-selected": item.isSelected,
                                })}
                                tabindex="0"
                            >
                                ${when(item?.icon, () => Icon({ iconName: item.icon, size }))}
                                ${when(
                                    item?.label,
                                    () => html`<span class="${rootClass}-itemLabel">${item.label}</span>`,
                                )}
                            </div>
                        `;
                    } else return item;
                },
            )}
            <div class="${rootClass}-selectionIndicator" style=${ifDefined(styleMap(selectorStyle))}></div>
        </div>
    `;
};
