import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { Rating as RatingTagComp } from './Rating'

export default {
	title: 'Design System/Rating',
	component: RatingTagComp,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=4RD0tTTcFDRbaSxU-0',
		},
	},
} as ComponentMeta<typeof RatingTagComp>

const RatingTagVariant: ComponentStory<typeof RatingTagComp> = (args) => <RatingTagComp {...args} />

export const Rating = RatingTagVariant.bind({})

Rating.args = {
	average: 4.3,
	reviewCount: 10,
}
