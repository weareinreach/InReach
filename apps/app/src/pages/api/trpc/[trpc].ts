import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter, createContext } from '@weareinreach/api'
import { env } from '@weareinreach/config'

/* Creating a handler for the tRPC endpoint. */
export default createNextApiHandler({
	router: appRouter,
	createContext,
	onError:
		env.NODE_ENV === 'development'
			? ({ path, error }) => {
					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					console.error(`❌ tRPC failed on ${path}: ${error}`)
			  }
			: undefined,
})
