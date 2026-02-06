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
		if (!ctx.session?.user) {
			invariant(ctx.session?.user)
		}

		const { permissions: userPerms, email } = ctx.session.user

		// 1. ROOT / SYSADMIN (God Tier)
		// Goal: Can see and do everything. Full access, no further checks.
		const isRoot = userPerms.some((p) => ['root', 'sysadmin', 'system'].includes(p))
		const isValidRoot = isRoot && email.endsWith('@inreach.org')

		if (isValidRoot) {
			return true
		}

		// 2. DATA PORTAL HIERARCHY (The Ladder)
		const isAdminRole = userPerms.includes('dataPortalAdmin')
		const isManagerRole = isAdminRole || userPerms.includes('dataPortalManager')
		const isBasicRole = isManagerRole || userPerms.includes('dataPortalBasic')

		if (isBasicRole) {
			const reqPerms = Array.isArray(meta?.hasPerm) ? meta.hasPerm : meta?.hasPerm ? [meta.hasPerm] : []

			// Blocklist: If the endpoint specifically requires Root strings
			const systemPerms = ['root', 'sysadmin', 'system', 'adminPermissions']
			if (reqPerms.some((p) => systemPerms.includes(p))) {
				return false
			}

			// Blocklist: Only dataPortalAdmin (and Root) can pass these
			const adminOnly = ['dataPortalAdmin', 'adminRoles']
			if (reqPerms.some((p) => adminOnly.includes(p))) {
				return isAdminRole
			}

			// Blocklist: Only Manager, Admin (and Root) can pass these
			const managerOnly = ['dataPortalManager', 'viewAllUsers', 'deleteUserReview']
			if (reqPerms.some((p) => managerOnly.includes(p))) {
				return isManagerRole
			}

			// Default: If it's not on a blocklist, Basic users can access it (e.g., all things Org)
			return true
		}

		// 3. FALLBACK: Granular Permission Check (For external users/associates)
		if (Array.isArray(meta?.hasPerm)) {
			return meta.hasPerm.every((perm) => userPerms.includes(perm))
		}

		if (typeof meta?.hasPerm === 'string') {
			return userPerms.includes(meta.hasPerm)
		}

		return false
	} catch (err) {
		if (err instanceof Error && err.message === 'Invariant failed') {
			return reject()
		}
		return false
	}
}

// Helper: Defines who is allowed to enter the dashboard environment
export const checkStaffPermissions = (userPermissions: string[]) => {
	const staffPermissions = [
		'dataPortalBasic',
		'dataPortalManager',
		'dataPortalAdmin',
		'sysadmin',
		'system',
		'root',
	]
	return userPermissions.some((perm) => staffPermissions.includes(perm))
}

/**
 * IsAdmin Middleware Goal: Used for User Management and sensitive Admin tabs. Access: Root and
 * dataPortalAdmin only.
 */
export const isAdmin = t.middleware(({ ctx, next }) => {
	if (ctx.session === null) return reject()

	const { permissions, email } = ctx.session.user
	const isDataPortalAdmin = permissions.includes('dataPortalAdmin')
	const isRoot = permissions.some((p) => ['root', 'sysadmin', 'system'].includes(p))
	const isValidRoot = isRoot && email.endsWith('@inreach.org')

	if (!(isDataPortalAdmin || isValidRoot)) {
		return reject()
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
			actorId: ctx.session.user.id,
			skipCache: true,
		},
	})
})

/**
 * IsStaff Middleware Goal: The entry point for the /admin dashboard. Access: Basic, Manager, Admin, and Root.
 */
export const isStaff = t.middleware(({ ctx, meta, next }) => {
	if (ctx.session === null) return reject()

	const hasStaffPerms = checkStaffPermissions(ctx.session.user.permissions)
	const permCheckPassed = checkPermissions(meta, ctx)

	if (!(hasStaffPerms && permCheckPassed)) {
		return reject()
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
			actorId: ctx.session.user.id,
			skipCache: true,
		},
	})
})

/**
 * HasPermissions Middleware Goal: For external Org owners/associates using specific edit points.
 */
export const hasPermissions = t.middleware(({ ctx, meta, next }) => {
	if (ctx.session === null) return reject()

	if (checkPermissions(meta, ctx)) {
		return next({
			ctx: {
				...ctx,
				session: ctx.session,
				actorId: ctx.session.user.id,
				skipCache: true,
			},
		})
	}

	throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Insufficient permissions' })
})
