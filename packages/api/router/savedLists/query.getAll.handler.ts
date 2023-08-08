import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getAll = async ({ ctx, input }: TRPCHandlerParams<undefined, 'protected'>) => {
	try {
		const lists = await prisma.userSavedList.findMany({
			where: {
				ownedById: ctx.session.user.id,
			},
			select: {
				_count: {
					select: {
						organizations: true,
						services: true,
						sharedWith: true,
					},
				},
				id: true,
				name: true,
			},
		})
		return lists
	} catch (error) {
		handleError(error)
	}
}
