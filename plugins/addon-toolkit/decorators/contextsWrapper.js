import { useEffect, makeDecorator, useGlobals } from "@storybook/preview-api";

/**
 * @type import('@storybook/csf').DecoratorFunction<import('@storybook/web-components').WebComponentsFramework>
 * @description Global properties added to each component; determines what stylesheets are loaded
 **/
export const withContextWrapper = makeDecorator({
	name: "withContextWrapper",
	parameterName: "context",
	wrapper: (StoryFn, context) => {
		const { args } = context;
		const [globals, updateGlobals] = useGlobals();

		const getDefaultValue = (type) => {
			if (!type) return null;
			if (type.defaultValue) return type.defaultValue;
			return type.options ? type.options[0] : null;
		};

		// This property informs which context stylesheets to source
		//    but does not source a stylesheet for itself
		/** @type boolean */
		const isExpress = args.express
			? args.express
			: getDefaultValue(globals.express);
		/** @type string */
		const color = args.color ? args.color : getDefaultValue(globals.color);
		/** @type string */
		const scale = args.scale ? args.scale : getDefaultValue(globals.scale);

		useEffect(() => {
			document.body.classList.toggle("spectrum--express", isExpress);
			document.body.classList.toggle(`spectrum--${color}`, true);
			document.body.classList.toggle(`spectrum--${scale}`, true);
		}, [color, scale, isExpress, updateGlobals]);

		return StoryFn(context);
	},
});
