import { MantineProvider, MantineProviderProps } from '@mantine/core'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { themes } from '@storybook/theming'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import { ReactNode } from 'react'

import { i18n, i18nLocales } from './i18next'
import { storybookTheme } from '../theme'

import './font.css'

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	layout: 'centered',
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
	nextRouter: {
		Provider: RouterContext.Provider,
	},
	darkMode: {
		dark: { ...themes.dark },
		light: { ...themes.light },
	},
	i18n,
	locale: 'en',
	locales: i18nLocales,
	viewport: {
		viewports: INITIAL_VIEWPORTS,
	},
}

const mantineProviderProps: Omit<MantineProviderProps, 'children'> = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}

const ThemeWrapper = (props: { children: React.ReactNode }) => {
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			{props.children}
		</MantineProvider>
	)
}

export const decorators = [(renderStory: Function) => <ThemeWrapper>{renderStory()}</ThemeWrapper>]
