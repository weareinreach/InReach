import { TRPCError } from '@trpc/server'
import invariant from 'tiny-invariant'

import { type Context } from '../context'
import { type Meta, t } from '../initTRPC'

/** Send unauthorized rejection via middleware */
const reject = () => {
	throw new TRPCError({ code: 'UNAUTHORIZED' })
}
export const checkPermissions = (meta: Meta | undefined, ctx: Context) => {
	try {
		/** No permissions submitted, throw error */
		if (typeof meta?.hasPerm === 'undefined') {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Invalid procedure configuration, missing permission requirements.',
			})
		}

		/** Check for session object, error if missing */
		invariant(ctx.session?.user)
		/** Check if user is `root`. If so, allow. */
		if (ctx.session.user.permissions.includes('root')) {
			return true
		}

		/** Check multiple permissions */
		if (Array.isArray(meta.hasPerm)) {
			if (meta.hasPerm.every((perm) => ctx.session?.user?.permissions?.includes(perm))) {
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

export const checkRole = (allowedRoles: string[], userRoles: string[]) => {
	for (const userRole of userRoles) {
		if (allowedRoles.includes(userRole)) {
			return true
		}
	}
	return false
}

export const isAdmin = t.middleware(({ ctx, meta, next }) => {
	if (ctx.session === null) {
		console.error('Rejected Admin procedure - no session context')
		return reject()
	}
	if (
		!(
			/*checkRole(['dataAdmin', 'sysadmin', 'root'], ctx.session?.user?.roles) &&*/ (
				checkPermissions({ hasPerm: 'root' }, ctx) &&
				/* Temporary solution - since we're just doling out the 'root' role for general data portal access right now, only those with @inreach.org emails can grant/deny access */
				ctx.session.user.email.endsWith('@inreach.org')
			)
		)
	) {
		console.error('Rejected Admin Procedure - Invalid permissions')
		console.error(ctx.session)
		return reject()
	}

	return next({
		ctx: {
			...ctx,
			session: { ...ctx.session, user: ctx.session.user },
			actorId: ctx.session.user.id,
			skipCache: true,
		},
	})
})
export const isStaff = t.middleware(({ ctx, meta, next }) => {
	if (ctx.session === null) {
		return reject()
	}
	if (
		!(
			checkRole(['dataManager', 'dataAdmin', 'sysadmin', 'system', 'root'], ctx.session?.user?.roles) &&
			checkPermissions(meta, ctx)
		)
	) {
		return reject()
	}

	return next({
		ctx: {
			...ctx,
			session: { ...ctx.session, user: ctx.session.user },
			actorId: ctx.session.user.id,
			skipCache: true,
		},
	})
})

export const hasPermissions = t.middleware(({ ctx, meta, next }) => {
	if (ctx.session === null) {
		return reject()
	}

	if (checkPermissions(meta, ctx)) {
		return next({
			ctx: {
				...ctx,
				session: { ...ctx.session, user: ctx.session.user },
				actorId: ctx.session.user.id,
				skipCache: true,
			},
		})
	}

	throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Insufficient permissions' })
})
