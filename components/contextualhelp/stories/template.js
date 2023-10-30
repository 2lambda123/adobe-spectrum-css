import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";

import { Template as ActionButton } from "@spectrum-css/actionbutton/stories/template.js";
import { Template as Link } from "@spectrum-css/link/stories/template.js";
import { Template as Popover } from "@spectrum-css/popover/stories/template.js";

import "@spectrum-css/contextualhelp";

// More on component templates: https://storybook.js.org/docs/web-components/writing-stories/introduction#using-args
export const Template = ({
    rootClass = "spectrum-ContextualHelp",
    id,
    iconName,
    title,
    body,
    link,
    popoverPlacement,
    customClasses = [],
}) => {
    return html`
        <div
            class=${classMap({
                [rootClass]: true,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
            id=${ifDefined(id)}
        >
            ${when(
                popoverPlacement.includes("top"),
                () =>
                    html`<div
                        class="dummy-spacing"
                        style=${styleMap({
                            position: "relative",
                            height: "125px",
                        })}
                    ></div>`,
            )}
            ${ActionButton({
                size: "xs",
                iconName,
                customClasses: [`${rootClass}-button`],
            })}
            ${Popover({
                isOpen: true,
                content: [
                    html` ${when(title, () => html`<h2 class="${rootClass}-heading">${title}</h2>`)}
                    ${when(body, () => html`<p class="${rootClass}-body">${body}</p>`)}
                    ${when(link, () =>
                        Link({
                            text: link.text,
                            url: link.url,
                            customClasses: [`${rootClass}-link`],
                        }),
                    )}`,
                ],
                position: popoverPlacement,
                customClasses: [`${rootClass}-popover`],
                customStyles: { top: "25px" },
            })}
        </div>
    `;
};
