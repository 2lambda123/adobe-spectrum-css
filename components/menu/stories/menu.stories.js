import isChromatic from "chromatic/isChromatic";

import { html } from "lit";

import { Template } from "./template";

export default {
  title: "Components/Menu",
  description:
    "A menu is used for creating a menu list. The various elements inside a menu can be: a menu group, a menu item, or a menu divider. Often a menu will appear in a popover so that it displays as a togglig menu.",
  component: "Menu",
  argTypes: {
    selectionMode: {
      name: "Selection Mode",
      type: { name: "boolean" },
      table: { disable: true },
      options: ["none", "single", "multiple"],
    },
    size: {
      name: "Size",
      type: { name: "string", required: true },
      table: {
        type: { summary: "string" },
        category: "Component",
      },
      options: ["s", "m", "l", "xl"],
      control: "select",
    },
    shouldTruncate: {
      name: "Truncate menu item label",
      type: { name: "boolean" },
      table: {
        type: { summary: "boolean" },
        category: "Component",
      },
      control: "boolean",
    },
    maxInlineSize: {
      name: "Max Inline Size",
      type: { name: "text", required: true },
      table: {
        type: { summary: "text" },
        category: "Component",
      },
      control: "text",
      if: { arg: "shouldTruncate", truthy: true },
    },
    hasActions: { table: { disable: true } },
    labelledby: { table: { disable: true } },
    items: { table: { disable: true } },
    role: { table: { disable: true } },
    subrole: { table: { disable: true } },
    customTrayStyles: { table: { disable: true } },
  },
  args: {
    rootClass: "spectrum-Menu",
    selectionMode: "none",
    size: "m",
    shouldTruncate: false,
    maxInlineSize: "150px",
    items: [
      { label: "Deselect" },
      { label: "Select inverse" },
      { label: "Feather" },
      { label: "Select and mask" },
      { type: "divider" },
      { label: "Save selection" },
      { label: "Make work path", isDisabled: true },
    ],
  },
  parameters: {
    actions: {
      handles: ["click .spectrum-Menu-item"],
    },
    status: {
      type: process.env.MIGRATED_PACKAGES.includes("menu")
        ? "migrated"
        : "legacy",
    },
  },
};

const Sizes = (args) => html`
	${isChromatic() ? html`
		${["s", "m", "l", "xl"].map((size) => {
			return Template({
				...args,
				size,
			});
		})}` : Template(args)}`;

export const Default = Sizes.bind({});
Default.storyName = "Standard with dividers";
Default.args = {};

export const Truncate = Template.bind({});
Truncate.args = {
  shouldTruncate: true,
  maxInlineSize: '100px',
};

export const MenuWithSections = Template.bind({});
MenuWithSections.args = {
  items: [
    {
      heading: "Section heading",
      idx: 1,
      items: [
        { label: "Action 1" },
        { label: "Action 2" },
        { label: "Action 3" },
      ],
    },
    { type: "divider" },
    {
      heading: "Section heading",
      idx: 2,
      items: [
        { label: "Edit", iconName: "Edit" },
        { label: "Copy", iconName: "Copy", isDisabled: true },
      ],
    },
  ],
};

export const MenuWithCheckmark = Template.bind({});
MenuWithCheckmark.args = {
  role: "listbox",
  subrole: "option",
  selectionMode: "single",
  items: [
    {
      idx: 1,
      heading: "San Francisco",
      id: "menu-heading-sf",
      items: [
        { label: "Financial District" },
        { label: "South of Market" },
        { label: "North Beach" },
      ],
    },
    { type: "divider" },
    {
      idx: 2,
      heading: "Oakland",
      id: "menu-heading-oak",
      items: [
        { label: "City Center" },
        { label: "Jack London Square", isDisabled: true },
        {
          label: `My best friend's mom's house in the burbs just off Silverado street`,
          isSelected: true,
          isChecked: true,
        },
      ],
    },
  ],
};

export const IconsAndDescriptions = Template.bind({});
IconsAndDescriptions.parameters = {
	docs: {
		description: {
			story:
				"A few different variants and states are demonstrated in this story. Menu items are shown with icons, with short descriptions, and with both. A selected item and a disabled item are shown for each. A max-width is set for the story, to test the text wrapping.",
		},
	},
};
IconsAndDescriptions.args = {
  role: "listbox",
  subrole: "option",
  customStyles: { maxWidth: '400px' },
  items: [
    {
      idx: 1,
      heading: "With icons",
      id: "menu-heading-with-icons",
      items: [
        {
          label: "Default menu item",
          iconName: "Export"
        },
        {
          label: "Focused menu item",
          iconName: "FolderOpen",
          isFocused: true
        },
        {
          label: "A menu item with a longer label that causes the text to wrap to the next line",
          iconName: "Share",
        },
        {
          label: "Disabled menu item",
          iconName: "Share",
          isDisabled: true,
        },
      ],
    },
    {
      idx: 2,
      heading: "With short descriptions",
      id: "menu-heading-short-desc",
      items: [
        {
          label: "Default menu item",
          description: "Short description",
        },
        {
          label: "Focused menu item",
          description: "Another short description",
          isFocused: true,
        },
        {
          label: "A menu item with a longer label that causes the text to wrap to the next line",
          description: "A description that is longer than average and is forced to wrap with an example max width.",
        },
        {
          label: "Disabled menu item",
          description: "Menu item description.",
          isDisabled: true,
        },
      ],
    },
    {
      idx: 3,
      heading: "With icons and short descriptions",
      id: "menu-heading-desc-and-icon",
      items: [
        {
          label: "Default menu item",
          iconName: "Export",
          description: "Short description",
        },
        {
          label: "Focused menu item",
          iconName: "FolderOpen",
          description: "Another short description",
          isFocused: true,
        },
        {
          label: "A menu item with a longer label that causes the text to wrap to the next line",
          iconName: "Share",
          description: "A description that is longer than average and is forced to wrap with an example max width.",
        },
        {
          label: "Disabled menu item",
          iconName: "Share",
          description: "Menu item description.",
          isDisabled: true,
        },
      ],
    },
  ],
};

export const SingleSelection = Template.bind({});
SingleSelection.parameters = {
	docs: {
		description: {
			story:
				"For single selection menu sections, menu items show a single checkmark to indicate the selected item.",
		},
	},
};
SingleSelection.args = {
  selectionMode: "single",
  customStyles: {maxWidth: '1000px'},
  items: [
    {
      label: "Marquee. Extra long menu item text to demonstrate wrapping text and alignment of icon in this situation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      isSelected: true,
      isChecked: true,
    },
    { label: "Add" },
    { label: "Subtract" },
  ],
};

export const SingleSelectionWithIcons = Template.bind({});
SingleSelectionWithIcons.args = {
  selectionMode: "single",
  customStyles: {maxWidth: '1000px'},
  items: [
    {
      label: "Marquee. Extra long menu item text to demonstrate wrapping text and alignment of icon in this situation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      iconName: "Selection",
      isSelected: true,
      isChecked: true,
    },
    {
      label: "Add",
      iconName: "SelectAdd",
    },
    {
      label: "Subtract",
      iconName: "SelectSubtract",
    },
  ],
};

export const MultipleSelection = Template.bind({});
MultipleSelection.args = {
  selectionMode: "multiple",
  customStyles: {maxWidth: '1000px'},
  items: [
    {
      label: "Marquee. Extra long menu item text to demonstrate wrapping text and alignment of icon in this situation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      isSelected: true,
      isChecked: true,
    },
    {
      label: "Add",
    },
    {
      label: "Subtract",
    },
  ],
};

export const WithActions = Template.bind({});
WithActions.args = {
  hasActions: true,
  customStyles: {maxWidth: '1000px'},
  items: [
    {
      label: "Marquee. Extra long menu item text to demonstrate wrapping text and alignment of icon in this situation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      label: "Add",
    },
    {
      label: "Subtract",
    },
  ],
};

export const WithValueAndActions = Template.bind({});
WithValueAndActions.args = {
  hasActions: true,
  customStyles: {maxWidth: '1000px'},
  items: [
    {
      label: "Marquee. Extra long menu item text to demonstrate wrapping text and alignment of icon in this situation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      value: "Value"
    },
    {
      label: "Add",
      value: "Value"
    },
    {
      label: "Subtract",
      value: "Value"
    },
  ],
};

export const DrillInSubmenu = Template.bind({});
DrillInSubmenu.storyName = "Drill-in for Submenu";
DrillInSubmenu.parameters = {
	docs: {
		description: {
			story:
				"When a menu item contains a submenu, a drill-in chevron will appear at the end of the menu item to show that a submenu is available.",
		},
	},
};
DrillInSubmenu.args = {
  items: [
    { label: "Deselect" },
    { label: "Select Inverse" },
    {
      label: "Feather really long item",
      isDrillIn: true,
      isOpen: true,
    },
    {
      label: "Select and Mask",
      isDrillIn: true,
      isDisabled: true,
      isOpen: true,
    },
    { label: "Save Selection" },
  ],
};

export const Collapsible = Template.bind({});
Collapsible.args = {
  shouldTruncate: true,
  items: [
    {
      label: "Web design",
      iconName: "DesktopAndMobile",
      isCollapsible: true,
      isOpen: true,
      items: [
        {
          label: "Web large",
          itemValue: "1920 x 1080",
        },
        {
          label: "Web medium",
          itemValue: "1366 x 768",
        },
        {
          label: "Web small",
          itemValue: "1280 x 800",
        },
      ],
    },
    {
      label: "Mobile",
      isCollapsible: true,
      isOpen: true,
      items: [
        {
          label: "Web large",
          itemValue: "1920 x 1080",
        },
        {
          label: "Web medium",
          itemValue: "1366 x 768",
        },
        {
          label: "Web small",
          itemValue: "1280 x 800",
        },
      ],
    },
    {
      label: "Tablet",
      iconName: "DeviceTablet",
      isCollapsible: true,
      items: [
        { label: "Defaults to not visible within closed item" },
      ],
    },
    {
      label: "Social media",
      iconName: "ShareAndroid",
      isCollapsible: true,
      items: [
        { label: "Defaults to not visible within closed item" },
      ],
    },
    {
      label: "Watches",
      iconName: "Watch",
      isCollapsible: true,
      items: [
        { label: "Defaults to not visible within closed item" },
      ],
    },
  ],
};

export const TraySubmenu = Template.bind({});
TraySubmenu.args = {
  selectionMode: "multiple",
  customStyles: {
    '--mod-menu-inline-size': '100%',
  },
  isTraySubmenu: true,
  items: [
    {
      heading: "Snap to",
      idx: 1,
      items: [
        {
          label: "Guides",
          isSelected: true,
          isChecked: true,
        },
        {
          label: "Grid",
        },
        {
          label: "Rulers",
        },
      ]
    }
  ],
  customTrayStyles: {
    alignItems: "end",
    position: isChromatic() ? "relative" : undefined,
    blockSize: isChromatic() ? "400px" : undefined,
  },
  customStorybookStyles: isChromatic() ? {
    blockSize: "400px",
    inlineSize: "400px",
  } : {},
};
