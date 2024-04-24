/* eslint-disable node/no-process-env */
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext, type WithTRPCConfig } from '@trpc/next'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'

import { getEnv } from '@weareinreach/env'
import { transformer } from '@weareinreach/util/transformer'

import { type AppRouter } from '../router'

const getBaseUrl = () => {
	// browser should use relative url
	if (typeof window !== 'undefined') {
		return ''
	}
	// SSR should use vercel url
	if (getEnv('VERCEL_URL')) {
		return `https://${getEnv('VERCEL_URL')}`
	}
	// dev SSR should use localhost
	return `http://localhost:${getEnv('PORT') ?? process.env.STORYBOOK ? 6006 : 3000}`
}

export const trpcConfig = {
	transformer,
	links: [
		loggerLink({
			enabled: (opts) =>
				(process.env.NODE_ENV === 'development' && typeof window !== 'undefined') ||
				(opts.direction === 'down' && opts.result instanceof Error),
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
