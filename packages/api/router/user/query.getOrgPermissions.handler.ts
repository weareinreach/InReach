import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getOrgPermissions = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	try {
		const permissions = await prisma.organizationPermission.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				organization: true,
				permission: true,
			},
		})
		return permissions
	} catch (error) {
		handleError(error)
	}
}
