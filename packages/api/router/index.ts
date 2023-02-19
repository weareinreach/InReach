import { defineRouter } from '~api/lib/trpc'

import { attributeRouter } from './attribute'
import { authRouter } from './auth'
import { locationRouter } from './location'
import { orgRouter } from './organization'
import { reviewRouter } from './review'
import { savedListRouter } from './savedLists'
import { serviceRouter } from './service'
import { systemRouter } from './system'
import { userRouter } from './user'

export const appRouter = defineRouter({
	attribute: attributeRouter,
	auth: authRouter,
	location: locationRouter,
	organization: orgRouter,
	review: reviewRouter,
	savedList: savedListRouter,
	service: serviceRouter,
	system: systemRouter,
	user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
