import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'

import { type Context } from './context'

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape }) {
		return shape
	},
})

/** Reusable middleware to ensure users are logged in */
const reject = () => {
	throw new TRPCError({ code: 'UNAUTHORIZED' })
}
const isAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user) {
		return reject()
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})
const isAdmin = t.middleware(({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user) return reject()
	if (!['dataAdmin', 'sysadmin'].includes(ctx.session?.user.role)) return reject()

	return next({
		ctx: {
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})
const isStaff = t.middleware(({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user) return reject()
	if (!['dataManager', 'dataAdmin', 'sysadmin', 'system'].includes(ctx.session?.user.role)) return reject()

	return next({
		ctx: {
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
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
