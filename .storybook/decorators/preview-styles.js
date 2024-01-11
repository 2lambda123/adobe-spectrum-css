import { makeDecorator, useEffect } from "@storybook/preview-api";

/**
 * @type import('@storybook/csf').DecoratorFunction<import('@storybook/web-components').WebComponentsFramework>
 **/
export const withPreviewStyles = makeDecorator({
	name: "withPreviewStyles",
	parameterName: "customStorybookStyles",
	wrapper: (StoryFn, context) => {
		const { args } = context;
		const staticColor = args.staticColor;
		let {
			position = "relative",
			// Gap is only supported for flex and grid so it does nothing for other display types
			gap = "1rem",
			padding = "max(10px, 1rem)",
			...customStyles
		} = args.customStorybookStyles ?? {};

		const hasSetting = (setting) => Object.keys(args.customStorybookStyles ?? {}).includes(setting);

		// Always prefer the customStorybookStyles over the default styles
		["gap", "position", "padding"].forEach(setting => {
			if (!hasSetting(setting)) return;
			customStyles[setting] = args.customStorybookStyles[setting];
		});

		const customStorybookStyles = {
			gap,
			padding,
			position,
			...customStyles,
		};

		useEffect(() => {
			const root = document.querySelector("#root-inner");

			// Start with a clean slate
			root.removeAttribute("style");

			Object.entries(customStorybookStyles).forEach(([key, value]) => {
				if (value) root.style[key] = value;
			});

			// automatically set the background color for static color settings
			if (staticColor) {
				document.body.style.backgroundColor = staticColor === "white" ? "rgb(15, 121, 125)" : staticColor === "black" ? "rgb(181, 209, 211)" : undefined;
			} else {
				document.body.style.backgroundColor = customStorybookStyles.backgroundColor ?? undefined;
			}

		}, [customStorybookStyles, staticColor]);

		return StoryFn(context);
	}
});
