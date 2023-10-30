// Import the component markup template
import { Template } from "./template";

/**
 * The Color wheel component lets users visually change an individual channel of a color on a circular track.
 */
export default {
    title: "Components/Color wheel",
    component: "ColorWheel",
    argTypes: {
        isDisabled: {
            name: "Disabled",
            type: { name: "boolean" },
            table: {
                type: { summary: "boolean" },
                category: "State",
            },
            control: "boolean",
        },
        isFocused: {
            name: "Focused",
            type: { name: "boolean" },
            table: {
                type: { summary: "boolean" },
                category: "State",
            },
            control: "boolean",
            if: { arg: "isDisabled", truthy: false },
        },
    },
    args: {
        rootClass: "spectrum-ColorWheel",
        isDisabled: false,
        isFocused: false,
    },
    parameters: {
        actions: {
            handles: [],
        },
        status: {
            type: process.env.MIGRATED_PACKAGES.includes("colorwheel") ? "migrated" : "legacy",
        },
    },
};

export const Default = Template.bind({});
Default.args = {};
