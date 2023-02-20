import { Meta, StoryObj } from '@storybook/react'

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
} satisfies Meta<typeof RatingTagComp>

type StoryDef = StoryObj<typeof RatingTagComp>

export const Default = {
	args: {
		average: 4.3,
		reviewCount: 10,
	},
} satisfies StoryDef

export const CountHidden = {
	args: {
		average: 4.3,
		reviewCount: 10,
		showCount: false,
	},
}

export const NoReviews = {
	args: {
		average: 0,
		reviewCount: 0,
	},
}
