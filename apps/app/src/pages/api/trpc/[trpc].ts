import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter, createContext } from '@weareinreach/api'

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
