import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { themes } from '@storybook/theming'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { mantineTheme } from 'storybook-addon-mantine'

import { RouterContext } from 'next/dist/shared/lib/router-context'

import { storybookTheme } from '../theme'
import './font.css'
import { i18n, i18nLocales } from './i18next'

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
		current: 'light',
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

const mantineProviderProps = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}
const mantineThemeDefs = [{ ...storybookTheme, themeName: 'Light Mode' }]

export const decorators = [mantineTheme(mantineThemeDefs, mantineProviderProps)]
