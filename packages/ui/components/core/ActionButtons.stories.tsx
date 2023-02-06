import { Meta } from '@storybook/react'

import { ActionButtons as ActionButtonsComponent } from './ActionButtons'

export default {
	title: 'Design System/Action Buttons',
	component: ActionButtonsComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=52%3A1420&t=sleVeGl2lJv7Df18-4',
		},
	},
	argTypes: { onClick: { actions: 'clicked' } },
} as Meta<typeof ActionButtonsComponent>

export const Save = {
	args: {
		iconKey: 'save',
	},
}
export const Saved = {
	args: {
		iconKey: 'saved',
	},
}
export const Share = {
	args: {
		iconKey: 'share',
	},
}
export const Print = {
	args: {
		iconKey: 'print',
	},
}
export const Delete = {
	args: {
		iconKey: 'delete',
	},
}
export const Review = {
	args: {
		iconKey: 'review',
	},
}
export const More = {
	args: {
		iconKey: 'more',
	},
}
