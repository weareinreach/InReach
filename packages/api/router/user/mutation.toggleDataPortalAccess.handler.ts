import { TRPCError } from '@trpc/server'

import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { DATA_PORTAL_ROLE_NAMES, getBestRoleIndex, getRoleIndex } from './lib/dataPortalRoleHierarchy'
import { type TToggleDataPortalAccessSchema } from './mutation.toggleDataPortalAccess.schema'

const toggleDataPortalAccess = async ({
	ctx,
	input,
}: TRPCHandlerParams<TToggleDataPortalAccessSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		// 1. Fetch current portal permissions from DB
		const portalPermissions = await prisma.permission.findMany({
			where: { name: { in: DATA_PORTAL_ROLE_NAMES } },
			select: { id: true, name: true },
		})

		const hierarchyIds = portalPermissions.map((p) => p.id)
		const targetUserId = input.userId
		const isAllowAction = input.action === 'allow'

		// The frontend passes the NAME string (e.g., 'dataPortalAdmin') in the permissionId field
		const permissionNameInput = input.permissionId

		if (isAllowAction && !permissionNameInput) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'A permission name must be provided when action is "allow".',
			})
		}

		/**
		 * SECURITY CHECK: Privilege Escalation Prevention
		 */
		const currentUserPerms = ctx.session.user.permissions
		const currentUserEmail = ctx.session.user.email
		const isActorRoot = currentUserPerms.includes('root')
		const isActorInternal = currentUserEmail.endsWith('@inreach.org')

		// Determine the highest rank of the person making the request
		const userBestIndex = getBestRoleIndex(currentUserPerms)
		// Determine the rank of the permission they are trying to assign
		const targetIndex = permissionNameInput ? getRoleIndex(permissionNameInput) : 999

		// A: Prevent assigning a role higher than your own (e.g., Manager assigning Admin)
		if (permissionNameInput && targetIndex < userBestIndex) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You cannot assign a role higher than your own access level.',
			})
		}

		// B: Strict Root Lock - only a user with 'root' AND an '@inreach.org' email can grant root access.
		// This alone isn't enough: it only looked at the role being newly *assigned*, so a non-root Admin
		// could still strip root from someone by denying access entirely or downgrading to a lower tier,
		// neither of which passes a permissionName of 'root'. The check below (right before the write)
		// closes that by looking at the target's *current* role instead.
		if (permissionNameInput === 'root' && (!isActorRoot || !isActorInternal)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'Only internal Root administrators can grant Root access.',
			})
		}

		let permissionIdToSet: string | undefined

		if (isAllowAction && permissionNameInput) {
			const targetPerm = portalPermissions.find((p) => p.name === permissionNameInput)
			if (!targetPerm) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Invalid permission name: ${permissionNameInput}.`,
				})
			}
			permissionIdToSet = targetPerm.id
		}

		/**
		 * DATABASE TRANSACTION We clear all existing portal roles first to prevent "Role Stacking"
		 */
		await prisma.$transaction(async (tx) => {
			// Locks the target's own row for the rest of this transaction, so a second concurrent call for
			// the same target (e.g. two admins acting on the same account at once) can't read the
			// pre-this-transaction role, both pass the root-removal check below, and both proceed - the
			// second call blocks here until the first commits, then re-reads the now-current role.
			await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${targetUserId} FOR UPDATE`

			// C: Strict Root Removal Lock - re-check against the target's CURRENT role, read inside this
			// locked transaction, not the role being requested. Only root can take root away, whether that's
			// an explicit deny or an allow to some lower tier.
			const currentTargetPermission = await tx.userPermission.findFirst({
				where: { userId: targetUserId, authorized: true, permissionId: { in: hierarchyIds } },
				select: { permission: { select: { name: true } } },
			})
			if (currentTargetPermission?.permission?.name === 'root' && (!isActorRoot || !isActorInternal)) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only internal Root administrators can remove Root access.',
				})
			}

			// Remove any existing Data Portal roles from the target user
			await tx.userPermission.deleteMany({
				where: {
					userId: targetUserId,
					permissionId: {
						in: hierarchyIds,
					},
				},
			})

			// If we are granting access, create the new record
			if (isAllowAction && permissionIdToSet) {
				await tx.userPermission.upsert({
					where: {
						userId_permissionId: { userId: targetUserId, permissionId: permissionIdToSet },
					},
					create: {
						userId: targetUserId,
						permissionId: permissionIdToSet,
						authorized: true,
					},
					update: {
						authorized: true,
					},
				})
			}
		})

		/**
		 * RE-EVALUATE STATE Fetch the new current state to return to the UI
		 */
		const currentActivePermission = await prisma.userPermission.findFirst({
			where: {
				userId: targetUserId,
				authorized: true,
				permissionId: {
					in: hierarchyIds,
				},
			},
			select: {
				permissionId: true,
				permission: { select: { name: true } },
			},
		})

		return {
			canAccessDataPortal: !!currentActivePermission,
			permissionId: currentActivePermission?.permissionId,
			permissionName: currentActivePermission?.permission?.name,
		}
	} catch (error) {
		return handleError(error)
	}
}

export default toggleDataPortalAccess
