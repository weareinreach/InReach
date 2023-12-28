import { type Meta, type StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { organization } from '~ui/mockData/organization'
import { review } from '~ui/mockData/review'

import { ReviewSection } from './Reviews'

export default {
	title: 'Sections/Reviews',
	component: ReviewSection,
	args: {
		reviews: [],
	},
	parameters: {
		msw: {
			handlers: [review.getByIds, review.getAverage, organization.getIdFromSlug, review.create],
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
	decorators: [StorybookGridDouble],
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
