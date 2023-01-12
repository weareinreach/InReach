import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import invariant from 'tiny-invariant'

import { Permission } from '../permissions'
import { type Context } from './context'

interface Meta {
	hasPerm: Permission | Permission[]
}

/** Send unauthorized rejection via middleware */
const reject = () => {
	throw new TRPCError({ code: 'UNAUTHORIZED' })
}

const checkPermissions = (meta: Meta | undefined, ctx: Context) => {
	try {
		/** No permissions submitted, pass */
		if (typeof meta === 'undefined') return true

		/** Check for session object, error if missing */
		invariant(ctx.session?.user)

		/** Check multiple permissions */
		if (Array.isArray(meta.hasPerm)) {
			if (meta.hasPerm.every((perm) => ctx.session?.user.permissions.includes(perm))) {
				return true
			}
			return false
		}

		/** Check single permission */
		return ctx.session.user.permissions.includes(meta.hasPerm)
	} catch (err) {
		/** If no session object, call reject */
		if (err instanceof Error && err.message === 'Invariant failed') {
			return reject()
		}
		/** Return false for any other errors */
		return false
	}
}

const t = initTRPC
	.context<Context>()
	.meta<Meta>()
	.create({
		transformer: superjson,
		errorFormatter({ shape }) {
			return shape
		},
	})

const isAuthed = t.middleware(({ ctx, meta, next }) => {
	if (!ctx.session || !ctx.session.user || !checkPermissions(meta, ctx)) {
		return reject()
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})
const isAdmin = t.middleware(({ ctx, meta, next }) => {
	if (!ctx.session || !ctx.session.user) return reject()
	if (!(['dataAdmin', 'sysadmin'].includes(ctx.session?.user.role) && checkPermissions(meta, ctx)))
		return reject()

	return next({
		ctx: {
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})
const isStaff = t.middleware(({ ctx, meta, next }) => {
	if (!ctx.session || !ctx.session.user) return reject()
	if (
		!(
			['dataManager', 'dataAdmin', 'sysadmin', 'system'].includes(ctx.session?.user.role) &&
			checkPermissions(meta, ctx)
		)
	)
		return reject()

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
