import { makeDecorator, useEffect } from "@storybook/preview-api";


import "@spectrum-css/vars/dist/spectrum-dark.css";
import "@spectrum-css/vars/dist/spectrum-darkest.css";
import "@spectrum-css/vars/dist/spectrum-light.css";

import "@spectrum-css/expressvars/dist/spectrum-dark.css";
import "@spectrum-css/expressvars/dist/spectrum-darkest.css";
import "@spectrum-css/expressvars/dist/spectrum-light.css";

/**
 * @type import('@storybook/csf').DecoratorFunction<import('@storybook/web-components').WebComponentsFramework>
 * @description Global properties added to each component; determines what stylesheets are loaded
 **/
export default makeDecorator({
	name: "withColorWrapper",
	parameterName: "color",
	wrapper: (StoryFn, context) => {
		const { globals, globalTypes } = context;

		const getDefaultValue = (type) => {
			if (!type) return null;
			if (type.defaultValue) return type.defaultValue;
			return type.options ? type.options[0] : null;
		};

		/** @type string */
		const color = globals.color ? globals.color : getDefaultValue(globalTypes.color) ?? "light";
		const colors = ["light", "dark", "darkest"];

		useEffect(() => {
			const container = document.querySelector('#root-inner') ?? document.body;

			for (const c of colors) {
				container.classList.toggle(`spectrum--${c}`, c === color);
			}
		}, [color]);

		return StoryFn(context);
	},
});
