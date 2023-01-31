import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { ActionButtons as ActionButtonsComponent } from './ActionButtons'

export default {
	title: 'Design System/Action Buttons',
	component: ActionButtonsComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=5MSsVbY5MYzkQyw4-0',
		},
	},
} as ComponentMeta<typeof ActionButtonsComponent>

const ActionButtons: ComponentStory<typeof ActionButtonsComponent> = () => <ActionButtonsComponent />

export const ActionButtonsOptions = ActionButtons.bind({})
