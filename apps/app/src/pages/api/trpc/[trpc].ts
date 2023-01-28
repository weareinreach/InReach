import { appRouter, createContext } from '@weareinreach/api'
import { createNextApiHandler } from '@weareinreach/api/trpc/server/adapters/next'

/* Creating a handler for the tRPC endpoint. */
export default createNextApiHandler({
	router: appRouter,
	createContext,
	onError:
		// eslint-disable-next-line node/no-process-env
		process.env.NODE_ENV === 'development'
			? ({ path, error }) => {
					console.error(`❌ tRPC failed on ${path}: ${error}`)
			  }
			: undefined,
})
