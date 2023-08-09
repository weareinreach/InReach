import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TIsSavedSchema } from './query.isSaved.schema'

export const isSaved = async ({ ctx, input }: TRPCHandlerParams<TIsSavedSchema>) => {
	if (!ctx.session?.user.id) return false

	const result = await prisma.userSavedList.findMany({
		where: {
			AND: [
				{ ownedById: ctx.session.user.id },
				{
					OR: [
						{ organizations: { some: { organizationId: input } } },
						{ services: { some: { serviceId: input } } },
					],
				},
			],
		},
		select: {
			id: true,
			name: true,
		},
	})
	if (!result.length) return false
	return result
}
