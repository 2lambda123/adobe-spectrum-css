// Import the component markup template
import { Template } from "./template";

/**
 * The Quick actions component is...
 */
export default {
    title: "Components/Quick actions",
    component: "QuickAction",
    argTypes: {
        isOpen: {
            name: "Open",
            type: { name: "boolean" },
            table: {
                type: { summary: "boolean" },
                category: "Component",
            },
            control: "boolean",
        },
        position: {
            name: "Position",
            type: { name: "string" },
            table: {
                type: { summary: "string" },
                category: "Component",
            },
            control: "select",
            options: ["left", "right"],
        },
        textOnly: {
            name: "Text only action buttons",
            type: { name: "boolean" },
            table: {
                type: { summary: "boolean" },
                category: "Advanced",
            },
            control: "boolean",
        },
    },
    args: {
        rootClass: "spectrum-QuickAction",
        isOpen: true,
        textOnly: false,
    },
    parameters: {
        actions: {
            handles: [],
        },
        status: {
            type: process.env.MIGRATED_PACKAGES.includes("quickaction") ? "migrated" : "legacy",
        },
    },
};

export const Default = Template.bind({});
Default.args = {
    content: [
        {
            iconName: "Edit",
        },
        {
            iconName: "Copy",
        },
        {
            iconName: "Delete",
        },
    ],
};

export const TextOnly = Template.bind({});
TextOnly.args = {
    content: [
        {
            label: "Edit",
        },
        {
            label: "Copy",
        },
        {
            label: "Delete",
        },
    ],
};
