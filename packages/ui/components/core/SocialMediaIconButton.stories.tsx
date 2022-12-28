import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Center } from '@mantine/core'

import { SocialMediaIconButton, approvedIcons } from './SocialMediaIcon'

export default {
	title: 'Core/SocialMediaIconButton',
	component: SocialMediaIconButton,
	decorators: [
		(Story) => (
			<Center style={{ width: '100vw' }}>
				<Story />
			</Center>
		),
	],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=MmGmrL63FUWcqBUe-0',
		},
	},
} as ComponentMeta<typeof SocialMediaIconButton>

const SocialMediaIconVariant: ComponentStory<typeof SocialMediaIconButton> = (args) => (
	<SocialMediaIconButton {...args} />
)

export const SocialMediaButton = SocialMediaIconVariant.bind({})

SocialMediaButton.args = {
	href: 'https://facebook.com',
	icon: approvedIcons.facebook,
	title: 'Social Media Icon',
}
