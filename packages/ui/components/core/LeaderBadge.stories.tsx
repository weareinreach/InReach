import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { LeaderBadge } from './LeaderBadge'

export default {
	title: 'Core/Leader Badge',
	component: LeaderBadge,
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
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=eVmG29UspAU8Pejs-0',
		},
	},
} as ComponentMeta<typeof LeaderBadge>

const BadgeComponentStory: ComponentStory<typeof LeaderBadge> = (args) => <LeaderBadge {...args} />

export const BadgeMinified = BadgeComponentStory.bind({})
export const BadgeRegular = BadgeComponentStory.bind({})

BadgeMinified.args = {
	color: 'red',
	emoji: '️‍️‍✊🏿',
	key_value: 'black-led',
	minify: true,
} as const

BadgeRegular.args = {
	color: 'blue',
	emoji: '️‍️‍🌎',
	key_value: 'Immigrant-led',
	minify: false,
} as const
