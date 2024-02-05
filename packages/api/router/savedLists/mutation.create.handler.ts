import { type z } from 'zod'

import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema, ZCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const list = await prisma.userSavedList.create({
		data: {
			name: input.name,
			ownedById: ctx.session.user.id,
		},
		select: {
			id: true,
			name: true,
		},
	})
	return list
}
export default create
