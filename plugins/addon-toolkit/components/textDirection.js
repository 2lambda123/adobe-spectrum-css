import React, { useState } from "react";

import { Icons, IconButton, WithTooltip } from "@storybook/components";

export const TextDirectionButton = ({
	active,
	title = "Text direction",
	description = "Direction of the content flow",
	onClick,
}) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false);

	return (
		<WithTooltip
			placement="bottom"
			tooltip={description}
			closeOnOutsideClick
			onVisibleChange={setIsTooltipVisible}
		>
			<IconButton
				key="Example"
				active={isTooltipVisible || active}
				title={title}
				onClick={onClick}
			>
				<Icons icon={active ? "menu" : "menualt"} />
				{active ? "rtl" : "ltr"}
			</IconButton>
		</WithTooltip>
	);
};
