export default ({ iconName, setName, ...globals }) => {
  const { scale } = globals;
  let icon;

  // Check adobe workflow icons first
  if (!setName || setName === "workflow") {
    try {
      icon = require(`!!raw-loader!@adobe/spectrum-css-workflow-icons/dist/${
        scale !== "medium" ? `24` : `18`
      }/${iconName}.svg`);
    } catch (e) {
      console.warn(e);
    }

    if (icon && icon.default) {
      return {
        icon: icon.default,
        setName: "workflow",
      };
    }
  }

  // Check the ui kit for icon set if not yet found
  try {
    icon = require(`!!raw-loader!@spectrum-css/icon/${
      scale ? scale : "medium"
    }/${iconName}.svg`);
  } catch (e) {
    console.warn(e);
  }

  if (icon && icon.default) {
    return {
      icon: icon.default,
      setName: "ui",
    };
  }

  return;
};
