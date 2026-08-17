import { type StoryFn } from '@storybook/nextjs'

import { GoogleMapsProvider } from '~ui/providers/GoogleMaps'

export const WithGoogleMaps = (Story: StoryFn) => {
	return (
		<GoogleMapsProvider>
			<Story />
		</GoogleMapsProvider>
	)
}
