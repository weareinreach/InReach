import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema, ZCreateSchema } from './mutation.create.schema'

export const create = async ({ input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const data = ZCreateSchema().dataParser.parse(input)

	const result = await prisma.orgLocation.create(data)

	return result
}
