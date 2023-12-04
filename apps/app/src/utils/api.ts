import {
	/*httpBatchLink,*/ unstable_httpBatchStreamLink as httpBatchStreamLink,
	loggerLink,
} from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { devtoolsLink } from 'trpc-client-devtools-link'

import { type AppRouter } from '@weareinreach/api'
import { getEnv } from '@weareinreach/env'
import { transformer } from '@weareinreach/util/transformer'
// import { createLoggerInstance } from '@weareinreach/util/logger'

// const log = createLoggerInstance('tRPC')
const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '' // browser should use relative url
	if (getEnv('VERCEL_URL')) return `https://${getEnv('VERCEL_URL')}` // SSR should use vercel url
	return `http://localhost:${getEnv('PORT') ?? 3000}` // dev SSR should use localhost
}

// eslint-disable-next-line node/no-process-env
const isDev = process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1'
export const api = createTRPCNext<AppRouter>({
	config() {
		return {
			transformer,
			links: [
				...(isDev
					? [
							devtoolsLink({
								enabled: isDev,
							}),
							loggerLink({
								enabled: () => isDev,
							}),
					  ]
					: []),

				httpBatchStreamLink({
					url: `${getBaseUrl()}/api/trpc`,
				}),
			],
			queryClientConfig: {
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 10, // 10 Minutes
						cacheTime: 1000 * 60 * 60, // 1 Hour
					},
				},
			},
		}
	},
	ssr: false,
})

/**
 * Inference helper for inputs
 *
 * @example Type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>
/**
 * Inference helper for outputs
 *
 * @example Type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>
