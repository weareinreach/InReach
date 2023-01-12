import { defineRouter } from '../lib/trpc'
import { authRouter } from './auth'
import { reviewRouter } from './review'
import { savedListRouter } from './savedLists'
import { userRouter } from './user'

export const appRouter = defineRouter({
	auth: authRouter,
	user: userRouter,
	savedList: savedListRouter,
	review: reviewRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
