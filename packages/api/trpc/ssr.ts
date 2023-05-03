import { createServerSideHelpers } from '@trpc/react-query/server'

import { createContext, transformer } from '../lib'
import { appRouter } from '../router'

export const trpcServerClient = async () =>
	createServerSideHelpers({
		router: appRouter,
		ctx: await createContext(),
		transformer,
	})
