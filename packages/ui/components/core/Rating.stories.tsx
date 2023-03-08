import { Meta, StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { Rating as RatingTagComp } from './Rating'

export default {
	title: 'Design System/Rating',
	component: RatingTagComp,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8521&t=sleVeGl2lJv7Df18-4',
		},
		msw: {
			handlers: [
				getTRPCMock({
					path: ['review', 'getAverage'],
					type: 'query',
					response: {
						average: 4.3,
						count: 10,
					},
				}),
			],
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
		organizationId: 'orgn_EJFOISU34JKDHFS',
	},
} satisfies StoryDef

export const CountHidden = {
	args: {
		hideCount: true,
		organizationId: 'orgn_EJFOISU34JKDHFS',
	},
}

export const NoReviews = {
	parameters: {
		msw: {
			handlers: [
				getTRPCMock({
					path: ['review', 'getAverage'],
					type: 'query',
					response: {
						average: null,
						count: 0,
					},
				}),
			],
		},
	},
	args: {
		organizationId: 'orgn_EJFOISU34JKDHFS',
	},
}
