import { Meta } from '@storybook/react'

import { searchResultsMock } from '~ui/mockData/searchResults'

import { SearchResultCard } from './SearchResultCard'

export default {
	title: 'Design System/Search Results',
	component: SearchResultCard,
} satisfies Meta<typeof SearchResultCard>

export const SingleResult = {
	args: {
		result: searchResultsMock[0],
	},
}

export const MultipleResults = {
	render: () => (
		<>
			{searchResultsMock.map((result) => (
				<SearchResultCard key={result.id} result={result} />
			))}
		</>
	),
}
