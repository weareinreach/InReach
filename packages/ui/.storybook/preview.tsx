import { MantineProvider } from '@mantine/core'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { themes } from '@storybook/theming'
import { RouterContext } from 'next/dist/shared/lib/router-context'

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

const ThemeWrapper = (props: { children: React.ReactNode }) => {
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			{props.children}
		</MantineProvider>
	)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const decorators = [(renderStory: Function) => <ThemeWrapper>{renderStory()}</ThemeWrapper>]
