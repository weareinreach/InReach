import { TRPCError } from '@trpc/server'

import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TToggleDataPortalAccessSchema } from './mutation.toggleDataPortalAccess.schema'

/**
 * Define the hierarchy explicitly. Index 0 is the most powerful.
 */
const DATA_PORTAL_ROLE_NAMES = ['root', 'dataPortalAdmin', 'dataPortalManager', 'dataPortalBasic']

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

		const getRoleIndex = (role: string) => {
			const idx = DATA_PORTAL_ROLE_NAMES.indexOf(role)
			return idx === -1 ? 999 : idx
		}

		// Determine the highest rank of the person making the request
		const userBestIndex = Math.min(...currentUserPerms.map(getRoleIndex))
		// Determine the rank of the permission they are trying to assign
		const targetIndex = permissionNameInput ? getRoleIndex(permissionNameInput) : 999

		// A: Prevent assigning a role higher than your own (e.g., Manager assigning Admin)
		if (permissionNameInput && targetIndex < userBestIndex) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You cannot assign a role higher than your own access level.',
			})
		}

		// B: Strict Root Lock
		// Only a user with 'root' AND an '@inreach.org' email can grant 'root' access.
		if (permissionNameInput === 'root') {
			const isActorRoot = currentUserPerms.includes('root')
			const isActorInternal = currentUserEmail.endsWith('@inreach.org')

			if (!isActorRoot || !isActorInternal) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only internal Root administrators can grant Root access.',
				})
			}
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
