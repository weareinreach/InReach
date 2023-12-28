import { type Meta } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
import { attribute } from '~ui/mockData/attribute'

import { SearchResultSidebar } from './SearchResultSidebar'

export default {
	title: 'Sections/Search Result Sidebar',
	component: SearchResultSidebar,
	decorators: [StorybookGridSingle],
	parameters: {
		layout: 'fullscreen',
		msw: {
			handlers: [attribute.getFilterOptions],
		},
	},
	args: {
		resultCount: 50,
	},
} satisfies Meta<typeof SearchResultSidebar>

export const Default = {}
