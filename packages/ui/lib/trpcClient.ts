/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import {
	// httpBatchLink,
	unstable_httpBatchStreamLink as httpBatchStreamLink,
	loggerLink,
} from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { createTRPCReact } from '@trpc/react-query'
import { devtoolsLink } from 'trpc-client-devtools-link'

import { type AppRouter } from '@weareinreach/api'
import { transformer } from '@weareinreach/api/lib/transformer'
import { getEnv } from '@weareinreach/env'

export const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '' // browser should use relative url
	if (getEnv('VERCEL_URL')) return `https://${getEnv('VERCEL_URL')}` // SSR should use vercel url
	return `http://localhost:${getEnv('PORT') ?? process.env.STORYBOOK ? 6006 : 3000}` // dev SSR should use localhost
}

export const nextTRPC = () =>
	createTRPCNext<AppRouter>({
		config() {
			return {
				transformer,
				links: [
					devtoolsLink({
						enabled: process.env.NODE_ENV === 'development',
					}),
					loggerLink({
						enabled: (opts) =>
							process.env.NODE_ENV === 'development' ||
							(opts.direction === 'down' && opts.result instanceof Error),
					}),
					httpBatchStreamLink({
						url: `${getBaseUrl()}/api/trpc`,
					}),
					// httpBatchLink({
					// 	url: `${getBaseUrl()}/api/trpc`,
					// }),
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

const storybookTRPC = () => createTRPCReact<AppRouter>()

export type StorybookTRPC = ReturnType<typeof storybookTRPC>
export type NextTRPC = ReturnType<typeof nextTRPC>

export const trpc = process.env.STORYBOOK ? storybookTRPC() : nextTRPC()
