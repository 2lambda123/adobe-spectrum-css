import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { Template as Tag } from "@spectrum-css/tag/stories/template.js";

import "@spectrum-css/taggroup";

export const Template = ({
    rootClass = "spectrum-TagGroup",
    ariaLabel,
    items,
    isRemovable = false,
    customClasses = [],
    customStyles = {},
    size = "m",
}) => {
    return html`
        <div
            class=${classMap({
                [rootClass]: true,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
            style=${ifDefined(styleMap(customStyles))}
            role="list"
            aria-label=${ifDefined(ariaLabel)}
        >
            ${items.map((i) => Tag({ ...i, size, hasClearButton: isRemovable, customClasses: [`${rootClass}-item`] }))}
        </div>
    `;
};
