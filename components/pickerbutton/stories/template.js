import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
// import { ifDefined } from 'lit-html/directives/if-definedjs';

import { Template as Icon } from "@spectrum-css/icon/stories/template.js";

import "../index.css";

// invalid, disabled, open, rounded, workflow icon only, ui icon only, texticon, quiet, sizes

// spectrum-PickerButton--textuiicon
// spectrum-PickerButton--uiicononly
// spectrum-PickerButton--icononly
// spectrum-PickerButton--rounded
// is-open
// icon size changes with t-shirt size

export const Template = ({
  rootClass = "spectrum-PickerButton",
  customClasses = [],
  icon,
  label,
  isInvalid = false,
  isDisabled = false,
  isQuiet = false,
  hideLabel = false,
  size = "m",
  ...globals
}) => {
  return html`
    <button
      aria-haspopup="listbox"
      class=${classMap({
        [rootClass]: true,
        [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
        [`${rootClass}--quiet`]: isQuiet,
        [`${rootClass}--invalid`]: isInvalid,
        [`is-disabled`]: isDisabled,
        ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
      })}
      ?disabled=${isDisabled}
    >
      <div class="spectrum-PickerButton-fill">
        ${label && !hideLabel ? html`<span class="${rootClass}-label">${label}</span>` : ""}
        ${icon
          ? Icon({
            ...globals,
            iconName: icon,
            customClasses: [`${rootClass}-icon`],
          })
        : ""}
      </div>
    </button>
  `;
}
