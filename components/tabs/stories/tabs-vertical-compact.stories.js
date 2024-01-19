// Import the component markup template
import { Template } from "./template";
import { html } from "lit";
import isChromatic from "chromatic/isChromatic";
import { argTypes } from "./index.js";

export default {
  title: "Components/Tabs/Vertical/Quiet/Compact",
  component: "Tabs",
  argTypes: argTypes,
  args: {
    rootClass: "spectrum-Tabs",
    size: "m",
    orientation: "vertical",
    isQuiet: true,
    isEmphasized: false,
    isCompact: true,
  },
  parameters: {
    actions: {
      handles: []
    },
    status: {
      type: process.env.MIGRATED_PACKAGES.includes('tabs') ? 'migrated' : undefined
    }
  }
};

const TabsGroup = ({
	customStyles = {},
	...args
}) => {
	return html`
		<div style="display: flex; gap: 2rem;">
			${Template({
            selectorStyle: {
            "height": "46px",
            "top": "0"
          },
            ...args
			})}
			${!isChromatic() ?
				Template({
            selectorStyle: {"width": "60px"},
            withIcons: true,
            ...args
				})
				: null }
        ${!isChromatic() ?
				Template({
            selectorStyle: {"width": "60px"},
            ...args,
            isEmphasized: true,
				})
				: null }
		</div>
	`;
};

export const Default = TabsGroup.bind({});
Default.args = {};
