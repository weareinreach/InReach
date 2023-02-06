import { Center } from '@mantine/core'
import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { Rating as RatingTagComp } from './Rating'

export default {
	title: 'Design System/Rating',
	component: RatingTagComp,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8521&t=sleVeGl2lJv7Df18-4',
		},
	},
} as Meta<typeof RatingTagComp>

export const Rating = {
	args: {
		average: 4.3,
		reviewCount: 10,
	},
}
