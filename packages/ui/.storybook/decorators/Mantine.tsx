import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { type StoryFn } from '@storybook/nextjs'
import { type ComponentType } from 'react'

import { storybookTheme } from '~ui/theme/storybook'

export const WithMantine = (Story: StoryFn) => {
	const StoryComponent = Story as ComponentType
	return (
		<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
			{/* <TypographyStylesProvider> */}
			{/* <ModalsProvider> */}
			<StoryComponent />
			{/* </ModalsProvider> */}
			{/* </TypographyStylesProvider> */}
			<Notifications />
		</MantineProvider>
	)
}
