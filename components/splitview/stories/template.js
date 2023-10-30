import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";

import "@spectrum-css/splitview";

export const Template = ({
    rootClass = "spectrum-SplitView",
    customClasses = [],
    orientation = "horizontal",
    isResizable = false,
    isCollapsible = false,
    collapsePosition,
    panelLabels = [],
    panelStyles = [],
    componentHeight = "200px",
}) => {
    const collapsibleStart =
        (typeof collapsePosition !== "undefined" && collapsePosition === "left") || collapsePosition === "top";
    const collapsibleEnd =
        (typeof collapsePosition !== "undefined" && collapsePosition === "right") || collapsePosition === "bottom";

    return html`
        <div
            style=${styleMap({
                height: componentHeight,
            })}
            class=${classMap({
                [rootClass]: true,
                [`${rootClass}--${orientation}`]: orientation,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
        >
            <div class="spectrum-SplitView-pane" style="${panelStyles[0]}">${panelLabels[0]}</div>
            <div
                class=${classMap({
                    [`${rootClass}-splitter`]: true,
                    ["is-draggable"]: isResizable,
                    [`is-collapsed${collapsibleStart ? "-start" : collapsibleEnd ? "-end" : ""}`]: isCollapsible,
                })}
                tabindex="0"
                data-testid="splitter"
            >
                ${when(isResizable, () => html`<div class="spectrum-SplitView-gripper"></div>`)}
            </div>
            <div class="spectrum-SplitView-pane" style="${panelStyles[1]}">${panelLabels[1]}</div>
        </div>
    `;
};
