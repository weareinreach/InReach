import { TRPCError } from '@trpc/server'
import invariant from 'tiny-invariant'

import { type Context } from '../context'
import { type Meta, t } from '../initTRPC'

/** Send unauthorized rejection via middleware */
const reject = () => {
	throw new TRPCError({ code: 'UNAUTHORIZED' })
}

export const checkPermissions = (meta: Meta | undefined, ctx: Context) => {
	console.log('checkPermissions: START')
	console.log('checkPermissions: META:', meta)
	console.log('checkPermissions: SESSION:', ctx.session)

	try {
		if (!ctx.session?.user) {
			console.error('checkPermissions: FAILED - No user in session context.')
			invariant(ctx.session?.user)
		}

		console.log('checkPermissions: User permissions:', ctx.session.user.permissions)

		const expandedUserPermissions = ['dataManager', 'dataAdmin', 'sysadmin', 'system', 'root']
		const hasExpandedUserPermission = ctx.session.user.permissions.some((perm) =>
			expandedUserPermissions.includes(perm)
		)

		if (hasExpandedUserPermission) {
			console.log('checkPermissions: PASSED - User has a super-user permission.')
			return true
		}

		if (Array.isArray(meta?.hasPerm)) {
			const hasEveryPermission = meta.hasPerm.every((perm) => ctx.session?.user?.permissions?.includes(perm))
			console.log(
				'checkPermissions: Checking multiple permissions. Required:',
				meta.hasPerm,
				'Has:',
				hasEveryPermission
			)
			if (hasEveryPermission) {
				return true
			}
			return false
		}

		if (typeof meta?.hasPerm === 'string') {
			const hasSinglePermission = ctx.session.user.permissions.includes(meta.hasPerm)
			console.log(
				'checkPermissions: Checking single permission. Required:',
				meta.hasPerm,
				'Has:',
				hasSinglePermission
			)
			return hasSinglePermission
		}

		console.error(
			'checkPermissions: FAILED - Invalid procedure configuration, missing permission requirements.'
		)
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Invalid procedure configuration, missing permission requirements.',
		})
	} catch (err) {
		console.error('checkPermissions: FAILED - Caught an unexpected error:', err)
		if (err instanceof Error && err.message === 'Invariant failed') {
			return reject()
		}
		return false
	}
}

// NOTE: checkRole is no longer used by isStaff, but is kept for other potential uses.
export const checkRole = (allowedRoles: string[], userRoles: string[]) => {
	// NEW LOGGING: Log the roles being checked
	console.log('checkRole: Checking user roles:', userRoles, 'against allowed roles:', allowedRoles)
	for (const userRole of userRoles) {
		if (allowedRoles.includes(userRole)) {
			console.log('checkRole: PASSED - User role', userRole, 'is in allowed roles.')
			return true
		}
	}
	console.log('checkRole: FAILED - No user roles match allowed roles.')
	return false
}

// NEW HELPER FUNCTION: checkStaffPermissions
export const checkStaffPermissions = (userPermissions: string[]) => {
	const staffPermissions = ['dataManager', 'dataAdmin', 'sysadmin', 'system', 'root']
	return userPermissions.some((perm) => staffPermissions.includes(perm))
}

export const isAdmin = t.middleware(({ ctx, meta, next }) => {
	// NEW LOGGING: Log start of middleware
	console.log('isAdmin: Starting check...')
	if (ctx.session === null) {
		console.error('Rejected Admin procedure - no session context')
		return reject()
	}

	// Break up the complex if statement to log individual results
	const hasRootPermission = checkPermissions({ hasPerm: 'root' }, ctx)
	const hasInreachEmail = ctx.session.user.email.endsWith('@inreach.org')
	console.log('isAdmin: Permissions check passed:', hasRootPermission, 'Email check passed:', hasInreachEmail)

	if (!(hasRootPermission && hasInreachEmail)) {
		console.error('Rejected Admin Procedure - Invalid permissions')
		console.error(ctx.session)
		return reject()
	}

	console.log('isAdmin: PASSED.')
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
	// NEW LOGGING: Log start of middleware
	console.log('isStaff: Starting check...')
	if (ctx.session === null) {
		console.error('isStaff: FAILED - No session context.')
		return reject()
	}

	// UPDATED LOGIC: No longer using checkRole. Check permissions directly.
	const hasStaffPerms = checkStaffPermissions(ctx.session.user.permissions)
	const permCheckPassed = checkPermissions(meta, ctx)

	console.log('isStaff: Has Staff Perms:', hasStaffPerms, 'Permission check passed:', permCheckPassed)

	if (!(hasStaffPerms && permCheckPassed)) {
		console.error('isStaff: FAILED - Invalid permissions or role.')
		console.error('  - Result of Staff Permissions Check:', hasStaffPerms)
		console.error('  - Result of Procedure Permission Check:', permCheckPassed)
		return reject()
	}

	console.log('isStaff: PASSED.')
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
	// NEW LOGGING: Log start of middleware
	console.log('hasPermissions: Starting check...')
	if (ctx.session === null) {
		console.error('hasPermissions: FAILED - No session context.')
		return reject()
	}

	const permCheckPassed = checkPermissions(meta, ctx)
	console.log('hasPermissions: Permission check passed:', permCheckPassed)

	if (permCheckPassed) {
		console.log('hasPermissions: PASSED.')
		return next({
			ctx: {
				...ctx,
				session: { ...ctx.session, user: ctx.session.user },
				actorId: ctx.session.user.id,
				skipCache: true,
			},
		})
	}

	console.error('hasPermissions: FAILED - Insufficient permissions.')
	throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Insufficient permissions' })
})
