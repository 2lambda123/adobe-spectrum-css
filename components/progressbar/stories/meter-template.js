import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import { Template as FieldLabel } from "@spectrum-css/fieldlabel/stories/template.js";

import "@spectrum-css/progressbar";

export const Template = ({
    rootClass = "spectrum-ProgressBar",
    customClasses = [],
    label,
    value,
    meterFill,
    size = "s",
}) => {
    return html`
        <div
            class=${classMap({
                [rootClass]: true,
                ["spectrum-Meter"]: true,
                [`spectrum-Meter--size${size?.toUpperCase()}`]: size,
                [`is-${meterFill}`]: meterFill !== "default",
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
            value="${value}%"
            role="progressbar"
            aria-valuenow="${value}%"
            aria-valuemin="0"
            aria-valuemax="100"
        >
            ${FieldLabel({
                size,
                label,
                alignment: undefined,
                customClasses: [`${rootClass}-label`],
            })}
            ${FieldLabel({
                size,
                label: `${value}%`,
                alignment: undefined,
                customClasses: [`${rootClass}-percentage`],
            })}
            <div class="${rootClass}-track">
                <div
                    class="${rootClass}-fill"
                    style=${styleMap({
                        width: `${value}%`,
                    })}
                ></div>
            </div>
        </div>
    `;
};
