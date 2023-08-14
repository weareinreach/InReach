import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByIdSchema } from './query.getById.schema'

export const getById = async ({ ctx, input }: TRPCHandlerParams<TGetByIdSchema, 'protected'>) => {
	const list = await prisma.userSavedList.findFirst({
		where: {
			id: input.id,
			OR: [
				{
					ownedById: ctx.session.user.id,
				},
				{
					sharedWith: {
						some: {
							userId: ctx.session.user.id,
						},
					},
				},
			],
		},
		include: {
			organizations: true,
			services: true,
			sharedWith: true,
		},
	})
	return list
}
