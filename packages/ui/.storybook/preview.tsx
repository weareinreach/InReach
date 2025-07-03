import './wdyr'
import './font.css'
import { type ViewportAddonParameter } from '@storybook/addon-viewport'
import { type Preview } from '@storybook/react'
import { type WhyDidYouRenderOptions } from '@welldone-software/why-did-you-render'
import { http, passthrough, type RequestHandler } from 'msw'
import { initialize as initializeMsw, mswLoader } from 'msw-storybook-addon'
import { type BaseRouter } from 'next/dist/shared/lib/router/router'
import { type Router } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

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
import authStates from './mockAuthStates'
import { viewport } from './viewports'

initializeMsw({
	serviceWorker: {
		options: {
			type: 'module',
		},
	},
	onUnhandledRequest: ({ method, url }) => {
		if (url.startsWith('/trpc') || url.startsWith('/api')) {
			console.error(`Unhandled ${method} request to ${url}.

				This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.
				If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
			`)
		}
	},
})

const preview: Preview = {
	parameters: {
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
		chromatic: {
			delay: 1000,
		},
		// pseudo: {
		// 	rootElement: 'storybook-root',
		// },
		msw: {
			handlers: {
				passthrough: http.get(/^\/(?!api|trpc).*$/, (ctx) => {
					console.log(`MSW Passthrough: ${ctx.request.url}`)
					passthrough()
				}),
			},
		},
		i18n,
		viewport,
	},

	globalTypes: {
		...i18NextGlobalTypes,
		pseudo: {},
	},

	decorators: [
		(Story, context) => {
			const sessionKey = context.parameters.nextAuthMock?.session
			const session = sessionKey ? authStates[sessionKey] : null

			return (
				<SessionProvider session={session}>
					<Story />
				</SessionProvider>
			)
		},
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
		}
		nextjs?: {
			router?: Partial<BaseRouter & { push: Router['push'] }>
		}
		locale?: LocaleCodes
		i18n?: typeof i18n
		viewport?: ViewportAddonParameter
		design?: DesignParams | DesignParams[]
		msw?: RequestHandler[] | { handlers: RequestHandler[] | Record<string, RequestHandler> }
		nextAuthMock?: { session: keyof typeof authStates }
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

type DesignParams = ({ name?: string } & DesignFigma) | DesignFigspec
type DesignFigma = {
	type: 'figma'
	url: `https://${string}`
}
type DesignFigspec = {
	type: 'figspec'
	url: `https://${string}`
	accessToken: string
}
