import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getPermissions = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	try {
		const permissions = await prisma.userPermission.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				permission: true,
			},
		})
		return permissions
	} catch (error) {
		handleError(error)
	}
}
