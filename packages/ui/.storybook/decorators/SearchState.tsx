import { type StoryContext, type StoryFn } from '@storybook/nextjs'
import { type ComponentType } from 'react'

import { SearchStateProvider } from '~ui/providers/SearchState'

export const WithSearchState = (Story: StoryFn, { parameters }: StoryContext) => {
	const StoryComponent = Story as ComponentType
	return (
		<SearchStateProvider initState={parameters.searchContext}>
			<StoryComponent />
		</SearchStateProvider>
	)
}
WithSearchState.displayName = 'SearchStateProvider'
