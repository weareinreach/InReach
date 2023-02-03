import invariant from 'tiny-invariant'

import { reject } from './'
import { type Context } from '../context'
import { type Meta, t } from '../initTRPC'

export const checkPermissions = (meta: Meta | undefined, ctx: Context) => {
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

export const checkRole = (allowedRoles: string[], userRoles: string[]) => {
	for (const userRole of userRoles) {
		if (allowedRoles.includes(userRole)) return true
	}
	return false
}

export const isAdmin = t.middleware(({ ctx, meta, next }) => {
	if (!ctx.session || !ctx.session.user) return reject()
	if (!(checkRole(['dataAdmin', 'sysadmin'], ctx.session?.user.roles) && checkPermissions(meta, ctx)))
		return reject()

	return next({
		ctx: {
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})
export const isStaff = t.middleware(({ ctx, meta, next }) => {
	if (!ctx.session || !ctx.session.user) return reject()
	if (
		!(
			checkRole(['dataManager', 'dataAdmin', 'sysadmin', 'system'], ctx.session?.user.roles) &&
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
