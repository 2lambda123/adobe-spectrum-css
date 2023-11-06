import { makeDecorator, useEffect } from "@storybook/preview-api";


import "@spectrum-css/vars/dist/spectrum-large.css";
import "@spectrum-css/vars/dist/spectrum-medium.css";

import "@spectrum-css/expressvars/dist/spectrum-large.css";
import "@spectrum-css/expressvars/dist/spectrum-medium.css";

/**
 * @type import('@storybook/csf').DecoratorFunction<import('@storybook/web-components').WebComponentsFramework>
 * @description Global properties added to each component; determines what stylesheets are loaded
 **/
export default makeDecorator({
	name: "withScaleWrapper",
	parameterName: "scale",
	wrapper: (StoryFn, context) => {
		const { globals, globalTypes } = context;

		const getDefaultValue = (type) => {
			if (!type) return null;
			if (type.defaultValue) return type.defaultValue;
			return type.options ? type.options[0] : null;
		};

		/** @type string */
		const scale = globals.scale ? globals.scale : getDefaultValue(globalTypes.scale) ?? "medium";

		useEffect(() => {
			const container = document.querySelector('#root-inner') ?? document.body;

			for (const s of scales) {
				container.classList.toggle(`spectrum--${s}`, s === scale);
			}
		}, [scale]);

		return StoryFn(context);
	},
});
