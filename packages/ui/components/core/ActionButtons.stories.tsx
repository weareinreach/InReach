import { Meta } from '@storybook/react'

import { ActionButtons as ActionButtonsComponent } from './ActionButtons'

export default {
	title: 'Design System/Action Buttons',
	component: ActionButtonsComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=MmGmrL63FUWcqBUe-0',
		},
	},
} as Meta<typeof ActionButtonsComponent>

export const ActionButtonDelete = {
	args: {
		iconKey: 'delete',
	},
}
export const ActionButtonMore = {
	args: {
		iconKey: 'more',
	},
}
export const ActionButtonPrint = {
	args: {
		iconKey: 'print',
	},
}
export const ActionButtonReview = {
	args: {
		iconKey: 'review',
	},
}
export const ActionButtonSave = {
	args: {
		iconKey: 'save',
	},
}
export const ActionButtonShare = {
	args: {
		iconKey: 'share',
	},
}
