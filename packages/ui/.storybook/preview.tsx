// This import exists only to pull in msw-storybook-addon's `StoryContext.msw` type augmentation - the
// empty named block is intentional (the module has no exports we need), and `import type` erases it
// entirely at build time so webpack doesn't try to bundle this .d.mts-only subpath as real JS.
// eslint-disable-next-line import/no-empty-named-blocks
import type {} from 'msw-storybook-addon/types'
import { setupWorker } from 'msw/browser'
import './wdyr'
import './font.css'
import { type Preview } from '@storybook/nextjs'
import { type WhyDidYouRenderOptions } from '@welldone-software/why-did-you-render'
import { http, passthrough } from 'msw'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { type BaseRouter } from 'next/dist/shared/lib/router/router'
import { type Router } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

import { type LocaleCodes } from '@weareinreach/db/generated/languages'
import { EditModeProvider } from '~ui/providers/EditMode'
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

const preview: Preview = {
	beforeEach({ msw }) {
		msw.use(
			http.get(/^\/(?!api|trpc).*$/, (ctx) => {
				console.log(`MSW Passthrough: ${ctx.request.url}`)
				passthrough()
			})
		)
	},

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
			// `SessionProvider`'s `session` prop is the raw NextAuth session shape ({ user, expires } | null) -
			// useSession() derives its own { data, status } wrapper from this. authStates entries store that
			// wrapper (to match next-auth-mock's own convention) - but for the 'unknown' state, `.session`
			// itself is null rather than a { data, status } object, so `.data` can't be accessed unconditionally.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const rawSession = sessionKey ? (authStates[sessionKey] as any).session : null
			const session = rawSession ? rawSession.data : null

			return (
				<SessionProvider session={session}>
					<Story />
				</SessionProvider>
			)
		},
		(Story) => (
			<EditModeProvider>
				<Story />
			</EditModeProvider>
		),
		WithGoogleMaps,
		WithSearchState,
		Layouts,
		WithMantine,
		WithI18n,
		WithTRPC,
		WithStrictMode,
		WithWhyDidYouRender,
	],

	loaders: [
		mswLoader(async () => {
			const worker = setupWorker()

			await worker.start({
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

			return worker
		}),
	],
}
export default preview

declare module '@storybook/nextjs' {
	export interface Parameters {
		actions?: {
			disable?: boolean
		}
		nextjs?: {
			router?: Partial<BaseRouter & { push: Router['push'] }>
		}
		locale?: LocaleCodes
		i18n?: typeof i18n
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		viewport?: any
		design?: DesignParams | DesignParams[]
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
	'hover' | 'active' | 'focusVisible' | 'focusWithin' | 'focus' | 'visited' | 'link' | 'target'

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
