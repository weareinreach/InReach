import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

const getAll = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
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
}
export default getAll
