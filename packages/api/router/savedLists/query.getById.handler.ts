import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { formatSavedList, savedListSelect } from './lib.savedListShape'
import { type TGetByIdSchema } from './query.getById.schema'

const getById = async ({ ctx, input }: TRPCHandlerParams<TGetByIdSchema, 'protected'>) => {
	const list = await prisma.userSavedList.findFirst({
		where: {
			id: input.id,
			OR: [{ ownedById: ctx.session.user.id }, { sharedWith: { some: { userId: ctx.session.user.id } } }],
		},
		select: savedListSelect({ publicOnly: false }),
	})
	if (!list) {
		return null
	}

	return formatSavedList(list)
}

export default getById
