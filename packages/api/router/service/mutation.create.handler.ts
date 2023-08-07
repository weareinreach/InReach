import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema, ZCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	try {
		const inputData = { actorId: ctx.session.user.id, operation: 'CREATE', data: input }

		const record = ZCreateSchema().dataParser.parse(inputData)
		const result = await prisma.orgService.create(record)
		return result
	} catch (error) {
		handleError(error)
	}
}
