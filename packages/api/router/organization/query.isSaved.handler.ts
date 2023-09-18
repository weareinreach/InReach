import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TIsSavedSchema } from './query.isSaved.schema'

export const isSaved = async ({ ctx, input }: TRPCHandlerParams<TIsSavedSchema>) => {
	if (!ctx.session?.user.id) return false

	const listEntries = await prisma.savedOrganization.findMany({
		where: {
			list: {
				ownedById: ctx.session.user.id,
			},
			organization: {
				slug: input,
			},
		},
		select: {
			list: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	})

	if (!listEntries.length) return false
	const lists = listEntries.map(({ list }) => list)
	return lists
}
