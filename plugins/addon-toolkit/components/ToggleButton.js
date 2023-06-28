import React, { useState } from "react";

import { Icons, IconButton, WithTooltip } from "@storybook/components";

export const ToggleButton = ({
	isActive,
	title,
	description,
	active,
	inactive,
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
				active={isTooltipVisible || isActive}
				title={title}
				onClick={onClick}
			>
				{active && active.icon && (
					<Icons icon={isActive ? active.icon : inactive.icon} />
				)}
				{active &&
					active.text &&
					`\xa0${isActive ? active.text : inactive.text}`}
			</IconButton>
		</WithTooltip>
	);
};
