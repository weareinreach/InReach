import { MantineProvider, TypographyStylesProvider, MantineProviderProps } from '@mantine/core'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { Story } from '@storybook/react'
import { themes } from '@storybook/theming'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

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

const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			<TypographyStylesProvider>
				<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
			</TypographyStylesProvider>
		</MantineProvider>
	)
}

export const decorators = [
	(Story: Story) => (
		<ThemeWrapper>
			<Story />
		</ThemeWrapper>
	),
]

type ThemeWrapperProps = {
	children: ReactNode
}
