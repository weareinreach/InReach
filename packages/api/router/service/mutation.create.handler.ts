import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema, ZCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const inputData = { actorId: ctx.session.user.id, operation: 'CREATE', data: input }

	const record = ZCreateSchema().dataParser.parse(inputData)
	const result = await prisma.orgService.create(record)
	return result
}
