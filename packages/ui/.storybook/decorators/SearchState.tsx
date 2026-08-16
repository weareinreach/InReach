import { type StoryContext, type StoryFn } from '@storybook/nextjs'

import { SearchStateProvider } from '~ui/providers/SearchState'

export const WithSearchState = (Story: StoryFn, { parameters }: StoryContext) => (
	<SearchStateProvider initState={parameters.searchContext}>
		<Story />
	</SearchStateProvider>
)
WithSearchState.displayName = 'SearchStateProvider'
