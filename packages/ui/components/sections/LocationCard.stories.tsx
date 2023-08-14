import { type Meta, type StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { location } from '~ui/mockData/location'
import { GoogleMapsProvider } from '~ui/providers/GoogleMaps'

import { LocationCard } from './LocationCard'

export default {
	title: 'Sections/Location Info',
	component: LocationCard,
	args: {
		locationId: '',
	},
	decorators: [
		StorybookGridDouble,
		(Story) => (
			<GoogleMapsProvider>
				<Story />
			</GoogleMapsProvider>
		),
	],
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
				location.forLocationCard,
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
