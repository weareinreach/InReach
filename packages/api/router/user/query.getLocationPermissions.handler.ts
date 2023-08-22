import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getLocationPermissions = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	const permissions = await prisma.locationPermission.findMany({
		where: {
			userId: ctx.session.user.id,
		},
		include: {
			location: true,
			permission: true,
		},
	})
	return permissions
}
