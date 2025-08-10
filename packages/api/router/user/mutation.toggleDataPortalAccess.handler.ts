import { TRPCError } from '@trpc/server'

import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TToggleDataPortalAccessSchema } from './mutation.toggleDataPortalAccess.schema'

// IMPORTANT: Define ALL relevant permission IDs from your database.
// Replace these with your actual database IDs for these permission names.
const PERMISSION_IDS = {
	root: 'perm_01GW2HKXRTRWKY87HNTTFZCBH1',
	dataPortalBasic: 'perm_01H0QX1XC037A47900JPAX6JBP',
	dataPortalManager: 'perm_01H0QX1XC04Z9G8H44G464YHQQ',
	dataPortalAdmin: 'perm_01H0QX1XC0335R04JMGMQ3KXVN',
}

// Define all permission IDs that are part of the Data Portal Access hierarchy.
const DATA_PORTAL_HIERARCHY_PERMISSION_IDS = [
	PERMISSION_IDS.dataPortalBasic,
	PERMISSION_IDS.dataPortalManager,
	PERMISSION_IDS.dataPortalAdmin,
	PERMISSION_IDS.root,
]

const toggleDataPortalAccess = async ({
	ctx,
	input,
}: TRPCHandlerParams<TToggleDataPortalAccessSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		const targetUserId = input.userId
		const isAllowAction = input.action === 'allow'
		const permissionIdToSet = input.permissionId

		if (isAllowAction && !permissionIdToSet) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'A permissionId must be provided when action is "allow".',
			})
		}

		if (permissionIdToSet && !DATA_PORTAL_HIERARCHY_PERMISSION_IDS.includes(permissionIdToSet)) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: `Invalid permissionId: ${permissionIdToSet}. It must be one of the defined data portal access IDs.`,
			})
		}

		await prisma.$transaction(async (tx) => {
			await tx.userPermission.deleteMany({
				where: {
					userId: targetUserId,
					permissionId: {
						in: DATA_PORTAL_HIERARCHY_PERMISSION_IDS,
					},
				},
			})

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

		// Re-evaluate the current state to return the correct permissionId
		const currentActivePermission = await prisma.userPermission.findFirst({
			where: {
				userId: targetUserId,
				authorized: true,
				permissionId: {
					in: DATA_PORTAL_HIERARCHY_PERMISSION_IDS,
				},
			},
			select: {
				permissionId: true,
			},
			orderBy: {
				// Order by hierarchy to get the highest level if multiple somehow exist
				permissionId: 'asc', // Assuming IDs are ordered such that 'root' is higher than 'basic' lexicographically
			},
		})

		return {
			canAccessDataPortal: !!currentActivePermission, // True if any permission is active
			permissionId: currentActivePermission?.permissionId, // Return the ID of the active permission, or undefined
		}
	} catch (error) {
		return handleError(error)
	}
}

export default toggleDataPortalAccess
