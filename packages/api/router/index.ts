import { defineRouter } from '~/lib/trpc'

import { authRouter } from './auth'
import { exampleRouter } from './example'
import { userRouter } from './user'

export const appRouter = defineRouter({
	example: exampleRouter,
	auth: authRouter,
	user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
