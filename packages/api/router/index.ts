import { defineRouter } from '~api/lib/trpc'

import { authRouter } from './auth'
import { locationRouter } from './location'
import { orgRouter } from './org'
import { reviewRouter } from './review'
import { savedListRouter } from './savedLists'
import { userRouter } from './user'

export const appRouter = defineRouter({
	auth: authRouter,
	user: userRouter,
	savedList: savedListRouter,
	review: reviewRouter,
	location: locationRouter,
	organization: orgRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
