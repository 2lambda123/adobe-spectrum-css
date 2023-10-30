import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";

import { useGlobals } from "@storybook/client-api";

import "@spectrum-css/popover";

export const Template = ({
    rootClass = "spectrum-Popover",
    size = "m",
    isOpen = false,
    withTip = false,
    position = "top",
    customClasses = [],
    id = "popover-1",
    testId,
    triggerId = "trigger",
    customStyles = {
        "--spectrum-popover-offset": "8px",
    },
    trigger,
    content = [],
}) => {
    if (content.length === 0) {
        console.warn("Popover: No content provided.");
        return html``;
    }

    const { transforms = [], additionalStyles = {} } = alignment(triggerId, id, position);

    return html`
        ${when(trigger && !isOpen, () => trigger)}
        <div
            class=${classMap({
                [rootClass]: true,
                "is-open": isOpen,
                [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
                [`${rootClass}--withTip`]: withTip,
                [`${rootClass}--${position}`]: typeof position !== "undefined",
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
            style=${styleMap({
                ...customStyles,
                transform: transforms.join(" "),
                ...additionalStyles,
            })}
            role="presentation"
            id=${ifDefined(id)}
            data-testid=${ifDefined(testId)}
        >
            ${when(content, () => content)}
            ${when(withTip, () =>
                position && ["top", "bottom"].some((e) => position.startsWith(e))
                    ? html`<svg class="${rootClass}-tip" viewBox="0 -0.5 16 9" width="10"><path class="${rootClass}-tip-triangle" d="M-1,-1 8,8 17,-1"></svg>`
                    : html`<svg class="${rootClass}-tip" viewBox="0 -0.5 9 16" width="10"><path class="${rootClass}-tip-triangle" d="M-1,-1 8,8 -1,17"></svg>`,
            )}
        </div>
    `;
};

const alignment = (triggerId, id, position) => {
    const [{ textDirection }] = useGlobals();

    // Get trigger element and popover
    const element = document.querySelector(`#${triggerId}`);

    if (!element) return [];
    const trigger = element.getBoundingClientRect();

    const popover = document.querySelector(`#${id}`);
    if (!popover) return [];

    const transforms = [];
    const additionalStyles = {};

    const pop = popover.getBoundingClientRect();

    let x, y;

    let parts = position.split("-");
    if (parts.length == 1) parts.push("center");
    if (textDirection === "rtl") {
        if (parts[1] === "start") parts[1] = "end";
        else if (parts[1] === "end") parts[1] = "start";
    }

    switch (parts[0]) {
        case "top":
            y = `var(--spectrum-popover-offset)`;
            break;
        case "bottom":
            y = `${trigger.bottom}px`;
            break;
        case "left":
            y = `${trigger.width / 2 - (pop.height > 0 ? pop.height / 2 : pop.height)}px`;
            break;
        case "right":
            y = `${trigger.width / 2 - (pop.height > 0 ? pop.height / 2 : pop.height)}px`;
            break;
    }

    // calc(var(--flow-direction) * ${x}px${xOffset}))
    switch (parts[1]) {
        case "center":
            x = `calc(${pop.width / 2}px - var(--spectrum-popover-offset))`;
            break;
        case "start":
        case "top":
            x = `calc(${trigger.left}px + var(--spectrum-popover-offset))`;
            break;
        case "end":
        case "bottom":
            x = `calc(${trigger.left + (pop.width > 0 ? pop.width / 2 : 0)}px)`;
            break;
    }

    if (x) transforms.push(`translateX(${x})`);
    if (y) transforms.push(`translateY(${y})`);

    return { transforms, additionalStyles };
};
