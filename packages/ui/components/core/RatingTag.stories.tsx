import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Center } from '@mantine/core'

import { RatingTag } from './RatingTag'

export default {
	title: 'Core/Rating Tag',
	component: RatingTag,
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
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=4RD0tTTcFDRbaSxU-0',
		},
	},
} as ComponentMeta<typeof RatingTag>

const RatingTagVariant: ComponentStory<typeof RatingTag> = (args) => <RatingTag {...args} />

export const Rating = RatingTagVariant.bind({})

Rating.args = {
	average: 4.3,
	reviewCount: 10,
}
