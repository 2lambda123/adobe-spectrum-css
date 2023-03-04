// Import the component markup template
import { Template } from "./template";

import { default as ButtonStories } from "@spectrum-css/button/stories/button.stories.js";
import { default as IconStories } from "@spectrum-css/icon/stories/icon.stories.js";

export default {
  title: "Splitbutton",
  description: "The Splitbutton component is...",
  component: "Splitbutton",
  argTypes: {
    size: {
      name: "Size",
      type: { name: "string", required: true },
      table: {
        type: { summary: "string" },
        category: "Component",
      },
      options: ["s", "m", "l", "xl"],
      control: "select"
    },
    variant: {
      name: "Variant",
      type: { name: "string", required: true },
      table: {
        type: { summary: "string" },
        category: "Component",
      },
      options: ["cta", "primary", "secondary"],
      control: "select",
    }
  },
  args: {
    rootClass: "spectrum-SplitButton",
    size: "m",
    variant: "cta",
  },
  parameters: {
    actions: {
      handles: []
    },
    status: {
      type: process.env.MIGRATED_PACKAGES.includes('splitbutton') ? 'migrated' : undefined
    }
  }
};

export const Default = Template.bind({});
Default.args = {};
