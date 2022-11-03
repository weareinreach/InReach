import { themes } from '@storybook/theming'
import { commonTheme } from '@weareinreach/ui/theme'
import { mantineTheme } from 'storybook-addon-mantine'

import { RouterContext } from 'next/dist/shared/lib/router-context'
import * as NextImage from 'next/image'

import React from 'react'

const OriginalNextImage = NextImage.default

Object.defineProperty(NextImage, 'default', {
	configurable: true,
	value: (props) => <OriginalNextImage {...props} unoptimized />,
})

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
}

const mantineProviderProps = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}
const mantineThemeDefs = [{ ...commonTheme, themeName: 'Light Mode' }]

export const decorators = [mantineTheme(mantineThemeDefs, mantineProviderProps)]

window.getEmbedNamespace = () => {
	const url = new URL(document.URL)
	const namespace = url.searchParams.get('embed')
	return namespace
}

window.getEmbedTheme = () => {
	return 'auto'
}
