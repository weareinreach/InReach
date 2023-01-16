import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Center } from '@mantine/core'

import { BadgeComponentGroup } from './BadgeGroup'

export default {
	title: 'Core/Leader Badge Group',
	component: BadgeComponentGroup,
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
} as ComponentMeta<typeof BadgeComponentGroup>

const BadgeGroupComponentStory: ComponentStory<typeof BadgeComponentGroup> = (args) => (
	<BadgeComponentGroup {...args} />
)

export const BadgeGroupMinified = BadgeGroupComponentStory.bind({})
export const BadgeGroupRegular = BadgeGroupComponentStory.bind({})

BadgeGroupMinified.args = {
	badges: [
		{
			color: 'yellow',
			emoji: '️‍️‍✊🏿',
			key_value: 'black-led',
			minify: true,
		},
		{
			color: 'green',
			emoji: '️‍️‍🌎',
			key_value: 'Immigrant-led',
			minify: true,
		},
	],
}

BadgeGroupRegular.args = {
	badges: [
		{
			color: 'blue',
			emoji: '️‍️‍✊🏿',
			key_value: 'black-led',
			minify: false,
		},
		{
			color: 'red',
			emoji: '️‍️‍🌎',
			key_value: 'Immigrant-led',
			minify: false,
		},
	],
}
