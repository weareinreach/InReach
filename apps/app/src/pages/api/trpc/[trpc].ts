import { createNextApiHandler } from '@trpc/server/adapters/next'
import { Logger } from 'tslog'

import { appRouter, createContext } from '@weareinreach/api'

const log = new Logger({ name: 'tRPC', type: 'json' })

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
})
