import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { initialize as initializeMsw, mswDecorator } from 'msw-storybook-addon'
import { BaseRouter } from 'next/dist/shared/lib/router/router'

import { WithI18n, WithMantine, WithTRPC } from './decorators'
import { i18n, CustomLocales } from './i18next'

import './font.css'

initializeMsw({
	serviceWorker: {
		// options: {
		// 	scope: '/trpc',
		// },
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
		expanded: true,
	},
	docs: {
		source: {
			type: 'dynamic',
			excludeDecorators: true,
		},
	},
	i18n,
	viewport: {
		viewports: INITIAL_VIEWPORTS,
	},
	chromatic: {
		delay: 1000,
	},
}
export const globalTypes = {
	locale: {
		name: 'Locale',
		description: 'Internationalization locale',
		defaultValue: 'en',
		toolbar: {
			icon: 'globe',
			items: [
				{ value: 'en', right: '🇺🇸', title: 'English' },
				// { value: 'fr', right: '🇫🇷', title: 'Français' },
				{ value: 'es', right: '🇪🇸', title: 'Español' },
				// { value: 'zh', right: '🇨🇳', title: '中文' },
				// { value: 'kr', right: '🇰🇷', title: '한국어' },
			],
		},
	},
}

export const decorators = [WithI18n, WithTRPC, WithMantine, mswDecorator]

declare module '@storybook/react' {
	export interface Parameters {
		nextjs?: {
			router?: Partial<BaseRouter>
		}
		locale?: CustomLocales[number]
		i18n?: typeof i18n
	}
}
