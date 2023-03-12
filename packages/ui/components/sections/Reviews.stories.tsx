import { Meta, StoryObj } from '@storybook/react'

import { StorybookGrid } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { reviewMockIds, reviewsMock } from '~ui/mockData/reviews'

import { ReviewSection } from './Reviews'

export default {
	title: 'Sections/Reviews',
	component: ReviewSection,
	args: {
		reviews: reviewMockIds,
	},
	parameters: {
		msw: {
			handlers: [
				getTRPCMock({
					path: ['review', 'getByIds'],
					type: 'query',
					response: reviewsMock,
				}),
				getTRPCMock({
					path: ['review', 'getAverage'],
					type: 'query',
					response: {
						average: 4.3,
						count: 10,
					},
				}),
				getTRPCMock({
					path: ['organization', 'getIdFromSlug'],
					type: 'query',
					response: {
						id: 'orgn_ORGANIZATIONID',
					},
				}),
				getTRPCMock({
					path: ['review', 'create'],
					type: 'mutation',
					response: {
						id: 'orev_NEWREVIEWID',
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
		layout: 'fullscreen',
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof ReviewSection>

type StoryDef = StoryObj<typeof ReviewSection>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef

const noReviewProps = {
	args: {
		reviews: [],
	},
	parameters: {
		msw: {
			handlers: [
				getTRPCMock({
					path: ['review', 'getByIds'],
					type: 'query',
					response: [],
				}),
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
} satisfies StoryDef

export const DesktopNoReviews = noReviewProps
export const MobileNoReviews = {
	...noReviewProps,
	parameters: {
		...noReviewProps.parameters,
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
}
