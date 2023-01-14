import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter, createContext } from '@weareinreach/api'

/* Creating a handler for the tRPC endpoint. */
export default createNextApiHandler({
	router: appRouter,
	createContext,
	onError:
		process.env.NODE_ENV === 'development'
			? ({ path, error }) => {
					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					console.error(`❌ tRPC failed on ${path}: ${error}`)
			  }
			: undefined,
})
