import { Meta } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { moreFilterMock } from '~ui/mockData/moreFilter'

import { SearchResultSidebar } from './SearchResultSidebar'

export default {
	title: 'Sections/Search Result Sidebar',
	component: SearchResultSidebar,
	decorators: [StorybookGridSingle],
	parameters: {
		layout: 'fullscreen',
		msw: {
			handlers: [
				getTRPCMock({
					path: ['attribute', 'getFilterOptions'],
					type: 'query',
					response: moreFilterMock,
				}),
			],
		},
	},
	args: {
		resultCount: 50,
	},
} satisfies Meta<typeof SearchResultSidebar>

export const Default = {}
