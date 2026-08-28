import { type StoryContext, type StoryFn } from '@storybook/nextjs'
import { type ComponentType } from 'react'

export const WithWhyDidYouRender = (Story: StoryFn, { parameters, component }: StoryContext) => {
	const { wdyr } = parameters
	if (wdyr && component) {
		// @ts-expect-error Module augmentation is too complex.
		component.whyDidYouRender = wdyr
	}
	const StoryComponent = Story as ComponentType
	return <StoryComponent />
}
