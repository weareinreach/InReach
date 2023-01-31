import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { initialize as initializeMsw, mswDecorator } from 'msw-storybook-addon'

import { WithI18n, WithMantine, WithTRPC } from './decorators'
import { i18n, i18nLocales } from './i18next'

import './font.css'

initializeMsw({
	serviceWorker: {
		options: {
			scope: '/trpc',
		},
	},
	onUnhandledRequest: ({ method, url }) => {
		if (url.pathname.startsWith('/trpc')) {
			console.error(`Unhandled ${method} request to ${url}.

        This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.

        If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
      `)
		}
	},
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
	i18n,
	locale: 'en',
	locales: i18nLocales,
	viewport: {
		viewports: INITIAL_VIEWPORTS,
	},
}

export const decorators = [WithI18n, WithTRPC, WithMantine, mswDecorator]
