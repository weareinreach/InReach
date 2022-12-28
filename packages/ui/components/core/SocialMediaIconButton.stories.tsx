import { Icon } from '@iconify/react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { ActionIcon, Center } from '@mantine/core'

import { approvedIcons } from '~/theme/functions'

export default {
	title: 'Core/SocialMediaIconButton',
	component: ActionIcon,
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
} as ComponentMeta<typeof ActionIcon>

const SocialMediaIconVariant: ComponentStory<typeof ActionIcon> = (args) => (
	<ActionIcon {...args}>
		<Icon icon={args.icon} height='1em' />
	</ActionIcon>
)

export const SocialMediaIconButtonSubtle = SocialMediaIconVariant.bind({})
export const SocialMediaIconButtonFilled = SocialMediaIconVariant.bind({})

SocialMediaIconButtonSubtle.args = {
	component: 'a',
	variant: 'subtle',
	href: 'https://facebook.com',
	target: '_blank',
	icon: approvedIcons.twitter,
	radius: 'xl',
	size: 'xl',
}

SocialMediaIconButtonFilled.args = {
	component: 'a',
	variant: 'filled',
	href: 'https://twitter.com',
	target: '_blank',
	icon: approvedIcons.twitter,
	radius: 'xl',
	size: 'xl',
}
