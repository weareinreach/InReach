import { createNextApiHandler } from '@trpc/server/adapters/next'

import { createContext } from '~/server/context'
import { appRouter } from '~/server/router'

// export API handler
export default createNextApiHandler({
	router: appRouter,
	createContext,
	onError:
		process.env.NODE_ENV === 'development'
			? ({ path, error }) => {
					console.error(`❌ tRPC failed on ${path}: ${error}`)
			  }
			: undefined,
})
