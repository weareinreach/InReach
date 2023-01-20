import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '@weareinreach/api'
import { transformer } from '@weareinreach/api/lib/transformer'
import { env } from '@weareinreach/config'
import { devtoolsLink } from 'trpc-client-devtools-link'

const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '' // browser should use relative url
	if (env.VERCEL_URL) return `https://${env.VERCEL_URL}` // SSR should use vercel url
	return `http://localhost:${env.PORT ?? 3000}` // dev SSR should use localhost
}

export const api = createTRPCNext<AppRouter>({
	config() {
		return {
			transformer,
			links: [
				devtoolsLink({
					enabled: env.NODE_ENV === 'development',
				}),
				loggerLink({
					enabled: (opts) =>
						env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error),
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
