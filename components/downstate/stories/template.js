import { html } from "lit";

import { Template as Button } from "@spectrum-css/button/stories/template.js";
import { Template as Checkbox } from "@spectrum-css/checkbox/stories/template.js";

import "../index.css";

export const Template = ({
  rootClass = "spectrum-DownState",
  ...globals
}) => {

  document.addEventListener("DOMContentLoaded", () => {
    for (let checkbox of document.querySelectorAll(".spectrum-Checkbox-box")) {
      // Ideally these values would be found dynamically but this can get wonky with logical properties
      const width = "14px";
      const height = "14px";

      checkbox.style.setProperty("--spectrum-downstate-width", width);
      checkbox.style.setProperty("--spectrum-downstate-height", height);
    };

    for (let button of document.querySelectorAll(".spectrum-Button")) {
      // Ideally these values would be found dynamically but this can get wonky with logical properties
      const width = "72px";
      const height = "32px";

      button.style.setProperty("--spectrum-downstate-width", width);
      button.style.setProperty("--spectrum-downstate-height", height);
    };
  });

  console.log(globals);

  return html`
    ${Checkbox({
      ...globals,
      isEmphasized: true,
      isChecked: true,
      label: "Checkbox",
      customDownstateClasses: [`${rootClass}`, `${rootClass}--min-perspective`],
    })}
    <div style="padding: 1rem 0;">
      ${Button({
        ...globals,
        treatment: "accent",
        label: "Edit",
        customClasses: [`${rootClass}`]
      })}
    </div>

  `;
}
