import { themes } from '@storybook/theming'
import { mantineTheme } from 'storybook-addon-mantine'

import { RouterContext } from 'next/dist/shared/lib/router-context'
import * as NextImage from 'next/image'

import React from 'react'

import { storybookTheme } from '../theme'
import './font.css'

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
const mantineThemeDefs = [{ ...storybookTheme, themeName: 'Light Mode' }]

export const decorators = [mantineTheme(mantineThemeDefs, mantineProviderProps)]

window.getEmbedNamespace = () => {
	const url = new URL(document.URL)
	const namespace = url.searchParams.get('embed')
	return namespace
}

window.getEmbedTheme = () => {
	return 'auto'
}
