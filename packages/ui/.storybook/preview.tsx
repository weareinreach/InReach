import { type BADGE } from '@geometricpanda/storybook-addon-badges'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { type Preview } from '@storybook/react'
import { type RequestHandler, rest } from 'msw'
import { initialize as initializeMsw, /*mswDecorator,*/ mswLoader } from 'msw-storybook-addon'
import { type BaseRouter } from 'next/dist/shared/lib/router/router'
import { type Router } from 'next/router'

import { type LocaleCodes, translatedLangs } from '@weareinreach/db/generated/languages'
import { type SearchStateProviderProps } from '~ui/providers/SearchState'

import {
	Layouts,
	type LayoutsDecorator,
	WithI18n,
	WithMantine,
	WithSearchState,
	WithStrictMode,
	WithTRPC,
} from './decorators'
import { i18n } from './i18next'
import { type Viewports } from './types'

import type authStates from './mockAuthStates'

import './font.css'

initializeMsw({
	serviceWorker: {
		options: {
			type: 'module',
		},
	},
	onUnhandledRequest: ({ method, url }) => {
		if (url.pathname.startsWith('/trpc' || '/api')) {
			console.error(`Unhandled ${method} request to ${url}.

        This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.
        If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
      `)
		}
	},
})

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: '^on.*' },
		layout: 'centered',
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
			expanded: true,
			sort: 'requiredFirst',
			hideNoControlsWarning: true,
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
		// pseudo: {
		// 	rootElement: 'storybook-root',
		// },
		msw: {
			handlers: {
				passthrough: rest.get(/^\/(?!api|trpc).*$/, (req) => req.passthrough()),
			},
		},
	},
	globalTypes: {
		locale: {
			name: 'Locale',
			description: 'Internationalization locale',
			defaultValue: 'en',
			toolbar: {
				icon: 'globe',
				items: translatedLangs.map((lang) => ({ value: lang.localeCode, title: lang.languageName })),
			},
		},
		pseudo: {},
	},
	decorators: [WithSearchState, Layouts, WithMantine, WithI18n, /*mswDecorator,*/ WithTRPC, WithStrictMode],
	loaders: [mswLoader],
}
export default preview

declare module '@storybook/react' {
	export interface Parameters {
		actions?: {
			disable?: boolean
			argTypesRegex?: string | RegExp
		}
		nextjs?: {
			router?: Partial<BaseRouter & { push: Router['push'] }>
		}
		locale?: LocaleCodes
		i18n?: typeof i18n
		viewport?: {
			viewports?: typeof INITIAL_VIEWPORTS
			defaultViewport?: Viewports
		}
		design?: {
			type: 'figma'
			url: `https://${string}`
		}
		msw?: RequestHandler[] | { handlers: RequestHandler[] | Record<string, RequestHandler> }
		nextAuthMock?: { session: keyof typeof authStates }
		badges?: BADGE[]
		layout?: 'centered' | 'fullscreen' | 'padded'
		layoutWrapper?: LayoutsDecorator
		disableStrictMode?: boolean
		disableWhyDidYouRender?: boolean
		pseudo?: Partial<Record<PseudoStates, string | string[] | boolean>> & { rootElement?: string }
		rqDevtools?: boolean
		searchContext?: SearchStateProviderProps['initState']
	}
}
type PseudoStates =
	| 'hover'
	| 'active'
	| 'focusVisible'
	| 'focusWithin'
	| 'focus'
	| 'visited'
	| 'link'
	| 'target'
