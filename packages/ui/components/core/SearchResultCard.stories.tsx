import { Meta } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { searchResultsMock } from '~ui/mockData/searchResults'

import { SearchResultCard } from './SearchResultCard'

export default {
	title: 'Design System/Search Results',
	component: SearchResultCard,
	decorators: [StorybookGridDouble],
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		loading: {
			type: 'boolean',
		},
	},
} satisfies Meta<typeof SearchResultCard>

export const SingleResult = {
	args: {
		result: searchResultsMock.orgs[0],
	},
}

export const MultipleResults = {
	render: () => (
		<>
			{searchResultsMock.orgs.map((result) => (
				<SearchResultCard key={result.id} result={result} />
			))}
		</>
	),
}
export const SingleLoading = {
	args: {
		loading: true,
	},
}
