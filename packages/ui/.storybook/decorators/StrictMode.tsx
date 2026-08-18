import { type StoryContext, type StoryFn } from '@storybook/nextjs'
import { type ComponentType, StrictMode } from 'react'

export const WithStrictMode = (Story: StoryFn, context: StoryContext) => {
	const StoryComponent = Story as ComponentType
	return context.parameters.disableStrictMode ? (
		<StoryComponent />
	) : (
		<StrictMode>
			<StoryComponent />
		</StrictMode>
	)
}
WithStrictMode.displayName = 'StrictModeWrapper'
