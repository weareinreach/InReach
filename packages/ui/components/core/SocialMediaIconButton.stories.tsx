import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { SocialMediaIconButton, approvedIcons } from './SocialMediaIconButton'

export default {
	title: 'Design System/Social Media Button',
	component: SocialMediaIconButton,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=MmGmrL63FUWcqBUe-0',
		},
	},
	argTypes: {
		icon: {
			options: Object.keys(approvedIcons),
		},
	},
} as ComponentMeta<typeof SocialMediaIconButton>

const SocialMediaIconVariant: ComponentStory<typeof SocialMediaIconButton> = (args) => (
	<SocialMediaIconButton {...args} />
)

export const SocialMediaButton = SocialMediaIconVariant.bind({})

SocialMediaButton.args = {
	href: '#',
	icon: 'facebook',
	title: 'Social Media Icon',
}
