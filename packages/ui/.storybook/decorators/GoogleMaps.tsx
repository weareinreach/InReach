import { type StoryFn } from '@storybook/nextjs'
import { type ComponentType } from 'react'

import { GoogleMapsProvider } from '~ui/providers/GoogleMaps'

export const WithGoogleMaps = (Story: StoryFn) => {
	// React 19's stricter JSX component typing rejects StoryFn's callable-and-annotated
	// intersection type directly - cast to a plain component type for JSX use. Storybook's
	// own runtime handles the actual render identically either way.
	const StoryComponent = Story as ComponentType
	return (
		<GoogleMapsProvider>
			<StoryComponent />
		</GoogleMapsProvider>
	)
}
