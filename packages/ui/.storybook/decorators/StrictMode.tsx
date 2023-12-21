import { type StoryContext, type StoryFn } from '@storybook/react'
import { StrictMode } from 'react'

export const WithStrictMode = (Story: StoryFn, context: StoryContext) =>
	context.parameters.disableStrictMode ? (
		<Story />
	) : (
		<StrictMode>
			<Story />
		</StrictMode>
	)
WithStrictMode.displayName = 'StrictModeWrapper'
