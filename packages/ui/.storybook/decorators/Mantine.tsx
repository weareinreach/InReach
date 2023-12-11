import { MantineProvider, type MantineProviderProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { type StoryFn } from '@storybook/react'

import { storybookTheme } from '~ui/theme/storybook'

const mantineProviderProps: Omit<MantineProviderProps, 'children'> = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}

export const WithMantine = (Story: StoryFn) => {
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			{/* <TypographyStylesProvider> */}
			{/* <ModalsProvider> */}
			<Story />
			{/* </ModalsProvider> */}
			{/* </TypographyStylesProvider> */}
			<Notifications />
		</MantineProvider>
	)
}
