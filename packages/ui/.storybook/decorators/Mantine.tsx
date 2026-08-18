import { MantineProvider, type MantineProviderProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { type StoryFn } from '@storybook/nextjs'
import { type ComponentType } from 'react'

import { storybookTheme } from '~ui/theme/storybook'

const mantineProviderProps: Omit<MantineProviderProps, 'children'> = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}

export const WithMantine = (Story: StoryFn) => {
	const StoryComponent = Story as ComponentType
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			{/* <TypographyStylesProvider> */}
			{/* <ModalsProvider> */}
			<StoryComponent />
			{/* </ModalsProvider> */}
			{/* </TypographyStylesProvider> */}
			<Notifications />
		</MantineProvider>
	)
}
