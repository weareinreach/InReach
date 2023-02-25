/* eslint-disable node/no-process-env */
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext, WithTRPCConfig } from '@trpc/next'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { getEnv } from '@weareinreach/config/env'
import { devtoolsLink } from 'trpc-client-devtools-link'

import { transformer } from '../lib/transformer'
import { type AppRouter } from '../router'

const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '' // browser should use relative url
	if (getEnv('VERCEL_URL')) return `https://${getEnv('VERCEL_URL')}` // SSR should use vercel url
	return `http://localhost:${getEnv('PORT') ?? 3000}` // dev SSR should use localhost
}

export const trpcConfig = {
	transformer,
	links: [
		devtoolsLink({
			// eslint-disable-next-line node/no-process-env
			enabled: process.env.NODE_ENV === 'development',
		}),
		loggerLink({
			enabled: (opts) =>
				// eslint-disable-next-line node/no-process-env
				process.env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error),
		}),
		httpBatchLink({
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
} satisfies WithTRPCConfig<AppRouter>

export const trpc = createTRPCNext<AppRouter>({
	config() {
		return trpcConfig
	},
	ssr: false,
})
/**
 * Inference helper for inputs
 *
 * @example Type HelloInput = RouterInputs['example']['hello']
 */
export type ApiInput = inferRouterInputs<AppRouter>
/**
 * Inference helper for outputs
 *
 * @example Type HelloOutput = RouterOutputs['example']['hello']
 */
export type ApiOutput = inferRouterOutputs<AppRouter>

export type ApiClient = typeof trpc
