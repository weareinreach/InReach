import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'

export const checkListOwnership = async ({ listId, userId }: CheckListOwnershipProps) => {
	const list = await prisma.userSavedList.findUniqueOrThrow({
		where: {
			id: listId,
		},
		select: { id: true, ownedById: true },
	})

	if (list.ownedById !== userId) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'List does not belong to user' })
	}
}
export type CheckListOwnershipProps = {
	listId: string
	userId: string
}
