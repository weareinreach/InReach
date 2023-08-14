import { createNextApiHandler } from '@trpc/server/adapters/next'

import { appRouter, createContext } from '@weareinreach/api'
import { createLoggerInstance } from '@weareinreach/util/logger'

const log = createLoggerInstance('tRPC')

/* Creating a handler for the tRPC endpoint. */
export default createNextApiHandler({
	router: appRouter,
	createContext,
	onError:
		// eslint-disable-next-line node/no-process-env
		process.env.NODE_ENV === 'development'
			? ({ path, error, type }) => {
					log.error(`❌ tRPC ${type} failed on ${path}: ${error}`)
			  }
			: typeof window === 'undefined'
			? ({ path, error, type }) => log.error({ type, path, error })
			: undefined,
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
