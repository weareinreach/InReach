import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

import { type Context } from './context'
import { isAdmin, isStaff, isAuthed } from './middleware'
import { Permission } from '../permissions'

export interface Meta {
	hasPerm: Permission | Permission[]
}

export const t = initTRPC
	.context<Context>()
	.meta<Meta>()
	.create({
		transformer: superjson,
		errorFormatter({ shape }) {
			return shape
		},
	})

export const defineRouter = t.router

/** Unprotected procedure */
export const publicProcedure = t.procedure

/** Protected procedure */
export const protectedProcedure = t.procedure.use(isAuthed)

/** Admin procedure */
export const adminProcedure = t.procedure.use(isAdmin)

/** Staff procedure */
export const staffProcedure = t.procedure.use(isStaff)
