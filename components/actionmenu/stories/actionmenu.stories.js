import { userEvent, within } from "@storybook/testing-library";

// Import the component markup template
import { Template } from "./template.js";

import { default as ActionButton } from "@spectrum-css/actionbutton/stories/actionbutton.stories.js";
import { default as Menu } from "@spectrum-css/menu/stories/menu.stories.js";
import { default as Popover } from "@spectrum-css/popover/stories/popover.stories.js";

/**
 * The Action menu component is an action button with a Popover.
 */
export default {
    title: "Components/Action menu",
    component: "Action menu",
    argTypes: {
        isOpen: {
            name: "Open",
            type: { name: "boolean" },
            table: {
                type: { summary: "boolean" },
                category: "State",
            },
            control: "boolean",
        },
    },
    args: {
        isOpen: true,
    },
    parameters: {
        layout: "padded",
        actions: {
            handles: [
                ...Popover.parameters.actions.handles,
                ...ActionButton.parameters.actions.handles,
                ...Menu.parameters.actions.handles,
            ],
        },
        status: {
            type: process.env.MIGRATED_PACKAGES.includes("actionmenu") ? "migrated" : "legacy",
        },
        chromatic: { delay: 2000 },
        docs: {
            story: {
                height: "200px",
            },
        },
    },
};

export const Default = Template.bind({});
Default.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await new Promise((resolve) => setTimeout(resolve, 100));

    await userEvent.click(canvas.getByRole("button", { id: "trigger" }));
};
Default.args = {
    isOpen: false,
    items: [
        {
            label: "Action 1",
        },
        {
            label: "Action 2",
        },
        {
            label: "Action 3",
        },
        {
            label: "Action 4",
        },
    ],
};
