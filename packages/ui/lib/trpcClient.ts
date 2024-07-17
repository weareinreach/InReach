/* eslint-disable node/no-process-env */
import {
	// httpBatchLink,
	unstable_httpBatchStreamLink as httpBatchStreamLink,
	loggerLink,
} from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { createTRPCReact } from '@trpc/react-query'

import { type AppRouter } from '@weareinreach/api'
import { getEnv } from '@weareinreach/env'
import { transformer } from '@weareinreach/util/transformer'

export const getBaseUrl = () => {
	// browser should use relative url
	if (typeof window !== 'undefined') {
		return ''
	}
	// SSR should use vercel url
	if (getEnv('VERCEL_URL')) {
		return `https://${getEnv('VERCEL_URL')}`
	}
	// dev SSR should use localhost
	return `http://localhost:${(getEnv('PORT') ?? process.env.STORYBOOK) ? 6006 : 3000}`
}

const isDev = process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1'

export const nextTRPC = () =>
	createTRPCNext<AppRouter>({
		config() {
			return {
				transformer,
				links: [
					...(isDev
						? [
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

const storybookTRPC = () => createTRPCReact<AppRouter>()

export type StorybookTRPC = ReturnType<typeof storybookTRPC>
export type NextTRPC = ReturnType<typeof nextTRPC>

export const trpc = process.env.STORYBOOK ? storybookTRPC() : nextTRPC()
