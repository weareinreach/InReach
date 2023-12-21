import { type StoryContext, type StoryFn } from '@storybook/react'

import { SearchStateProvider } from '~ui/providers/SearchState'

export const WithSearchState = (Story: StoryFn, { parameters }: StoryContext) => (
	<SearchStateProvider initState={parameters.searchContext}>
		<Story />
	</SearchStateProvider>
)
WithSearchState.displayName = 'SearchStateProvider'
