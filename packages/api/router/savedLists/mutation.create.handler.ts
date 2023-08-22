import { type z } from 'zod'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema, ZCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const { dataParser } = ZCreateSchema()

	const inputData = {
		actorId: ctx.session.user.id,
		ownedById: ctx.session.user.id,
		data: input,
		operation: 'CREATE',
	} satisfies z.input<typeof dataParser>

	const data = dataParser.parse(inputData)

	const list = await prisma.userSavedList.create(data)
	return list
}
