import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteSchema } from './mutation.delete.schema'

export const deleteList = async ({ ctx, input }: TRPCHandlerParams<TDeleteSchema, 'protected'>) => {
	try {
		const list = await prisma.userSavedList.findUniqueOrThrow({
			where: {
				id: input.id,
			},
			select: { id: true, ownedById: true },
		})

		if (list.ownedById !== ctx.session.user.id) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'List does not belong to user' })
		}

		const result = await prisma.userSavedList.delete({
			where: {
				id: input.id,
			},
			select: {
				id: true,
				name: true,
			},
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
