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
		msw: [
			getTRPCMock({
				path: ['review', 'getByIds'],
				type: 'query',
				response: reviewsMock,
			}),
		],
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
