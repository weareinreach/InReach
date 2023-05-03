import { type BADGE } from '@geometricpanda/storybook-addon-badges'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { type Preview } from '@storybook/react'
import { type RequestHandler } from 'msw'
import { initialize as initializeMsw, mswDecorator } from 'msw-storybook-addon'
import { type BaseRouter } from 'next/dist/shared/lib/router/router'
import { type Router } from 'next/router'

import { type LocaleCodes, translatedLangs } from '@weareinreach/api/generated/languages'

import { Layouts, type LayoutsDecorator, WithI18n, WithMantine, WithStrictMode, WithTRPC } from './decorators'
import { i18n } from './i18next'
import { type Viewports } from './types'

import type authStates from './mockAuthStates'

import './font.css'

initializeMsw({
	onUnhandledRequest: ({ method, url }) => {
		if (url.pathname.startsWith('/trpc' || '/api')) {
			console.error(`Unhandled ${method} request to ${url}.

        This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.
        If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
      `)
		}
	},
})
// whyDidYouRender(React, {
// 	trackAllPureComponents: true,
// 	// collapseGroups: true,
// })

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
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
	decorators: [Layouts, WithMantine, WithI18n, mswDecorator, WithTRPC, WithStrictMode],
}
export default preview

declare module '@storybook/react' {
	export interface Parameters {
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
