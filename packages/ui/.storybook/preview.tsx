import './wdyr'
import './font.css'
import { type BADGE } from '@geometricpanda/storybook-addon-badges'
import { type Preview } from '@storybook/react'
import { type WhyDidYouRenderOptions } from '@welldone-software/why-did-you-render'
import { http, passthrough, type RequestHandler } from 'msw'
import { initialize as initializeMsw, mswLoader } from 'msw-storybook-addon'
import { type BaseRouter } from 'next/dist/shared/lib/router/router'
import { type Router } from 'next/router'

import { type LocaleCodes } from '@weareinreach/db/generated/languages'
import { type SearchStateProviderProps } from '~ui/providers/SearchState'

import { i18NextGlobalTypes } from './decorators'
import {
	Layouts,
	type LayoutsDecorator,
	WithGoogleMaps,
	WithI18n,
	WithMantine,
	WithSearchState,
	WithStrictMode,
	WithTRPC,
	WithWhyDidYouRender,
} from './decorators'
import { i18n } from './i18next'
import { viewport, type ViewportConfig } from './viewports'

import type authStates from './mockAuthStates'

initializeMsw({
	serviceWorker: {
		options: {
			type: 'module',
		},
	},
	onUnhandledRequest: ({ method, url }) => {
		if (url.startsWith('/trpc' || '/api')) {
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
		viewport,
		chromatic: {
			delay: 1000,
		},
		// pseudo: {
		// 	rootElement: 'storybook-root',
		// },
		msw: {
			handlers: {
				passthrough: http.get(/^\/(?!api|trpc).*$/, () => passthrough()),
			},
		},
	},
	globalTypes: {
		...i18NextGlobalTypes,
		pseudo: {},
	},
	decorators: [
		WithGoogleMaps,
		WithSearchState,
		Layouts,
		WithMantine,
		WithI18n,
		WithTRPC,
		WithStrictMode,
		WithWhyDidYouRender,
	],
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
		viewport?: ViewportConfig
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
		pseudo?: Partial<Record<PseudoStates, string | string[] | boolean>> & { rootElement?: string }
		rqDevtools?: boolean
		searchContext?: SearchStateProviderProps['initState']
		wdyr?: boolean | WhyDidYouRenderOptions
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
