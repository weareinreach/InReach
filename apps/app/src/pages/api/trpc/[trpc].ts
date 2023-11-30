import * as Sentry from '@sentry/nextjs'
import { createNextApiHandler } from '@trpc/server/adapters/next'

import { appRouter, createContext } from '@weareinreach/api'
import { createLoggerInstance } from '@weareinreach/util/logger'

const log = createLoggerInstance('tRPC')

// eslint-disable-next-line node/no-process-env
const isDev = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

/* Creating a handler for the tRPC endpoint. */
export default createNextApiHandler({
	router: appRouter,
	createContext,
	onError: ({ path, error, type }) => {
		switch (true) {
			case isDev: {
				if (error.code === 'INTERNAL_SERVER_ERROR') {
					Sentry.captureException(error, (scope) => {
						scope.setTags({
							'tRPC.path': path,
							'tRPC.operation': type,
						})
						return scope
					})
				}
				log.error(`❌ tRPC ${type} failed on ${path}:`, error)
				break
			}
			case isServer: {
				if (error.code === 'INTERNAL_SERVER_ERROR') {
					Sentry.captureException(error, (scope) => {
						scope.setTags({
							'tRPC.path': path,
							'tRPC.operation': type,
						})
						return scope
					})
				}
				log.error({ type, path, error })
				break
			}
			default: {
				return
			}
		}
	},
	responseMeta(opts) {
		const { ctx, errors, type } = opts

		const shouldSkip = ctx?.skipCache ?? false
		const allOk = errors.length === 0
		const isQuery = type === 'query'

		if (ctx?.res && !shouldSkip && allOk && isQuery) {
			const ONE_DAY_IN_SECONDS = 60 * 60 * 24
			return {
				headers: {
					'cache-control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
				},
			}
		}
		return {}
	},
})
