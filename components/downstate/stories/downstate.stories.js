import { Template } from './template';

export default {
  title: "UtilityClasses/Down state",
  description: "Down state is utility class used to add an active state to S2 components.",
  component: "DownState",
  argTypes: {},
  args: {
    rootClass: "spectrum-DownState",
  },
  parameters: {
    actions: {
      handles: []
    },
    status: {
      type: process.env.MIGRATED_PACKAGES.includes('downstate') ? 'migrated' : undefined
    }
  },
};

export const Default = Template.bind({});
Default.args = {};
