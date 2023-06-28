import React, { useCallback, useState } from "react";

import { addons, types, useGlobals } from "@storybook/manager-api";

import { FORCE_RE_RENDER } from "@storybook/core-events";
import { Separator } from "@storybook/components";

import { ToggleButton } from "./components/ToggleButton";

//@todo import { getSelectedIcon, getSelectedTitle } from '../utils/get-selected';

const ADDON_ID = "@spectrum-css/addon-toolkit";
const SWITCHER_ID = `${ADDON_ID}/context-switcher`;
const PARAM_KEY = "context";

addons.register(ADDON_ID, (api) => {
	addons.add(SWITCHER_ID, {
		title: "Context switcher",
		//👇 Sets the type of UI element in Storybook
		type: types.TOOL,
		paramKey: PARAM_KEY,
		//👇 Shows the Toolbar UI element if either the Canvas or Docs tab is active
		match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
		render: ({}) => {
			const [globals, updateGlobals] = useGlobals();

			const currentValue = globals[PARAM_KEY];
			const isActive = currentValue ?? false;

			/** @type import('@storybook/components').IconsProps['icon'] */
			// const icon = getSelectedIcon({ currentValue, items }) ?? "paintbrush";
			// const title =
			// 	getSelectedTitle({ currentValue, items }) ?? "Context switcher";

			// Function that will update the global value and trigger a UI refresh.
			const handleItemClick = useCallback(() => {
				updateGlobals({ [PARAM_KEY]: !isActive });

				// Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
				addons.getChannel().emit(FORCE_RE_RENDER);
			}, [isActive, updateGlobals]);

			return (
				<>
					<Separator />
					<ToggleButton
						isActive={globals.reducedMotion}
						title="Reduced motion"
						description="Toggle the prefers-reduced-motion styling"
						active={{
							icon: "stop",
							text: "Show motion",
						}}
						inactive={{
							icon: "play",
							text: "Stop motion",
						}}
						onClick={handleItemClick}
					/>
					<ToggleButton
						isActive={globals.textDirection}
						title="Text direction"
						description="Direction of the content flow"
						active={{ icon: "menu", text: "ltr" }}
						inactive={{ icon: "menualt", text: "rtl" }}
						onClick={handleItemClick}
					/>
				</>
			);
		},
	});
});
