import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";

import { Template as ActionGroup } from "@spectrum-css/actiongroup/stories/template.js";
import { Template as CloseButton } from "@spectrum-css/closebutton/stories/template.js";
import { Template as FieldLabel } from "@spectrum-css/fieldlabel/stories/template.js";
import { Template as Popover } from "@spectrum-css/popover/stories/template.js";

import "@spectrum-css/actionbar";

export const Template = ({
    rootClass = "spectrum-ActionBar",
    size = "m",
    isOpen = true,
    isEmphasized = false,
    isSticky = false,
    isFixed = false,
    isFlexible = false,
    customClasses = [],
}) => {
    return html`
        <div
            class=${classMap({
                [rootClass]: true,
                [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
                [`${rootClass}--emphasized`]: isEmphasized,
                [`${rootClass}--sticky`]: isSticky,
                [`${rootClass}--fixed`]: isFixed,
                [`${rootClass}--flexible`]: isFlexible,
                "is-open": isOpen,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
        >
            ${Popover({
                customClasses: [`${rootClass}-popover`],
                isOpen,
                content: [
                    CloseButton({
                        label: "Clear selection",
                        staticColor: isEmphasized ? "white" : undefined,
                    }),
                    FieldLabel({
                        size: "s",
                        label: "2 Selected",
                    }),
                    ActionGroup({
                        size: "m",
                        areQuiet: true,
                        staticColors: isEmphasized ? "white" : undefined,
                        content: [
                            {
                                iconName: "Edit",
                                label: "Edit",
                                hideLabel: true,
                            },
                            {
                                iconName: "Copy",
                                label: "Copy",
                                hideLabel: true,
                            },
                            {
                                iconName: "Delete",
                                label: "Delete",
                                hideLabel: true,
                            },
                        ],
                    }),
                ],
            })}
        </div>
    `;
};
