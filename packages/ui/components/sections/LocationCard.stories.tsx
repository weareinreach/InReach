import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { locationMock } from '~ui/mockData/locationCard'

import { LocationCard } from './LocationCard'

export default {
	title: 'Sections/Location Info',
	component: LocationCard,
	args: {
		location: locationMock,
	},
	decorators: [StorybookGridDouble],
	parameters: {
		layout: 'fullscreen',
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
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
	},
} satisfies Meta<typeof LocationCard>

type StoryDef = StoryObj<typeof LocationCard>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef
