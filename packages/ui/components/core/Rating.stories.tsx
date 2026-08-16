import { type Meta, type StoryObj } from '@storybook/nextjs'

import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { Rating as RatingTagComp } from './Rating'

export default {
	title: 'Design System/Rating',
	component: RatingTagComp,

	beforeEach({ msw }) {
		msw.use(
			getTRPCMock({
				path: ['review', 'getAverage'],
				type: 'query',
				response: {
					average: 4.3,
					count: 10,
				},
			})
		)
	},

	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8521&t=sleVeGl2lJv7Df18-4',
		},
	},

	argTypes: {
		hideCount: {
			defaultValue: false,
			type: 'boolean',
		},
		forceLoading: {
			defaultValue: false,
			type: 'boolean',
		},
	},
} satisfies Meta<typeof RatingTagComp>

type StoryDef = StoryObj<typeof RatingTagComp>

export const Default = {
	args: {
		recordId: 'orgn_EJFOISU34JKDHFS',
	},
} satisfies StoryDef

export const CountHidden = {
	args: {
		hideCount: true,
		recordId: 'orgn_EJFOISU34JKDHFS',
	},
} satisfies StoryDef

export const NoReviews = {
	beforeEach({ msw }) {
		msw.use(
			getTRPCMock({
				path: ['review', 'getAverage'],
				type: 'query',
				response: {
					average: null,
					count: 0,
				},
			})
		)
	},

	args: {
		recordId: 'orgn_EJFOISU34JKDHFS',
	},
} satisfies StoryDef
