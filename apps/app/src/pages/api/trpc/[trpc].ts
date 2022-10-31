// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from '@trpc/server/adapters/next'

import { createContext } from '../../../server/context'
import { appRouter } from '../../../server/router'

// export API handler
export default createNextApiHandler({
	router: appRouter,
	createContext,
})
