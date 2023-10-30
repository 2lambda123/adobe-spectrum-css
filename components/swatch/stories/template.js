import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { useArgs } from "@storybook/client-api";
import { capitalize, lowerCase } from "lodash-es";

import { Template as OpacityCheckerboard } from "@spectrum-css/opacitycheckerboard/stories/template.js";

import "@spectrum-css/swatch";

export const Template = ({
    rootClass = "spectrum-Swatch",
    size = "m",
    isSelected = false,
    isDisabled = false,
    rounding = "regular",
    customClasses = [],
    swatchColor = "rgb(174, 216, 230)",
    customStyles = {},
    id,
}) => html`
    <div
        class=${classMap({
            [rootClass]: true,
            [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
            [`${rootClass}--rounding${capitalize(lowerCase(rounding))}`]:
                typeof rounding !== "undefined" && rounding !== "regular",
            "is-selected": !isDisabled && isSelected,
            "is-disabled": isDisabled,
            ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
        })}
        ?disabled=${isDisabled}
        id=${ifDefined(id)}
        style=${ifDefined(
            styleMap({
                "--spectrum-picked-color": swatchColor,
                ...customStyles,
            }),
        )}
        tabindex="0"
        @click=${() => {
            const [, updateArgs] = useArgs();
            updateArgs({ isSelected: !isSelected });
        }}
        @focusout=${() => {
            const [, updateArgs] = useArgs();
            updateArgs({ isSelected: false });
        }}
        @keypress=${(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const [, updateArgs] = useArgs();
            updateArgs({ isSelected: !isSelected });
        }}
    >
        ${OpacityCheckerboard({
            customClasses: [`${rootClass}-fill`],
        })}
    </div>
`;
