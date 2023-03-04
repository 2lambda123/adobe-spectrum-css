import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
// import { ifDefined } from 'lit-html/directives/if-defined.js';

import { Template as Button } from '@spectrum-css/button/stories/template.js';
import { Template as Icon } from "@spectrum-css/icon/stories/template.js";

import "../index.css";

export const Template = ({
  rootClass = "spectrum-SplitButton",
  customClasses = [],
  size = "m",
  variant = "cta",
  ...globals
}) => {
  return html`
    <div class=${classMap({
      [rootClass]: true,
      ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
    })}>
      ${Button({
        ...globals,
        variant: "accent",
        size: "m",
        treatment: "fill",
        label: "Split Button",
        customClasses: ["spectrum-SplitButton-action"]
      })}
      ${Button({
        ...globals,
        variant: "accent",
        size: "m",
        treatment: "fill",
        hideLabel: true,
        iconName: "ChevronDown100",
        customClasses: ["spectrum-SplitButton-trigger"]
      })}
    </div>
    
    <br />
    <br />
    
    <div class=${classMap({
      [rootClass]: true,
      [`${rootClass}--left`]: true,
      ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
    })}>
      ${Button({
        ...globals,
        variant: "accent",
        size: "m",
        treatment: "fill",
        hideLabel: true,
        iconName: "ChevronDown100",
        customClasses: ["spectrum-SplitButton-trigger"]
      })}
      ${Button({
        ...globals,
        variant: "accent",
        size: "m",
        treatment: "fill",
        label: "Split Button",
        customClasses: ["spectrum-SplitButton-action"]
      })}
    </div>
  `;
}

{/* <button class="spectrum-Button spectrum-Button--sizeM spectrum-Button--fill spectrum-Button--accent spectrum-SplitButton-action"><span class="spectrum-Button-label">Split Button</span></button>
  <button class="spectrum-Button spectrum-Button--sizeM spectrum-Button--fill spectrum-Button--accent spectrum-SplitButton-trigger">
    <svg class="spectrum-Icon spectrum-UIIcon-ChevronDown100 spectrum-SplitButton-icon" focusable="false" aria-hidden="true">
      <use xlink:href="#spectrum-css-icon-Chevron100" />
    </svg>
  </button> */}
