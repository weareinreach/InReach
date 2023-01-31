import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { ActionButtons as ActionButtonsComponent, approvedButtonIcons } from './ActionButtons'

export default {
	title: 'Design System/Action Buttons',
	component: ActionButtonsComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=MmGmrL63FUWcqBUe-0',
		},
	},
} as ComponentMeta<typeof ActionButtonsComponent>

const ActionButton: ComponentStory<typeof ActionButtonsComponent> = (args) => (
	<ActionButtonsComponent {...args} />
)

export const ActionButtonSave = ActionButton.bind({})
export const ActionButtonShare = ActionButton.bind({})
export const ActionButtonPrint = ActionButton.bind({})
export const ActionButtonDelete = ActionButton.bind({})
export const ActionButtonReview = ActionButton.bind({})

ActionButtonSave.args = {
	iconKey: 'save',
}
ActionButtonShare.args = {
	iconKey: 'share',
}
ActionButtonPrint.args = {
	iconKey: 'print',
}
ActionButtonDelete.args = {
	iconKey: 'delete',
}
ActionButtonReview.args = {
	iconKey: 'review',
}
