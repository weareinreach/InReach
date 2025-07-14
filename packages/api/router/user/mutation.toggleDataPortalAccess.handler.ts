import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TToggleDataPortalAccessSchema } from './mutation.toggleDataPortalAccess.schema'

const ROOT_PERMISSION_ID = 'perm_01GW2HKXRTRWKY87HNTTFZCBH1'

const toggleDataPortalAccess = async ({
	ctx,
	input,
}: TRPCHandlerParams<TToggleDataPortalAccessSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		const result = await prisma.userPermission.upsert({
			where: { userId_permissionId: { userId: input.userId, permissionId: ROOT_PERMISSION_ID } },
			create: {
				userId: input.userId,
				permissionId: ROOT_PERMISSION_ID,
				authorized: input.action === 'allow',
			},
			update: {
				authorized: input.action === 'allow',
			},
		})
		return {
			canAccessDataPortal: result.authorized,
		}
	} catch (error) {
		return handleError(error)
	}
}
export default toggleDataPortalAccess
