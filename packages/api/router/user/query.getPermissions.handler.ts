import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getPermissions = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	const permissions = await prisma.userPermission.findMany({
		where: {
			userId: ctx.session.user.id,
		},
		include: {
			permission: true,
		},
	})
	return permissions
}
