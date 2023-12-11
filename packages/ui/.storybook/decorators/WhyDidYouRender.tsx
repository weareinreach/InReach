import { type StoryContext, type StoryFn } from '@storybook/react'

export const WithWhyDidYouRender = (Story: StoryFn, { parameters, component }: StoryContext) => {
	const { wdyr } = parameters
	if (wdyr && component) {
		// @ts-expect-error Module augmentation is too complex.
		component.whyDidYouRender = wdyr
	}
	return <Story />
}
