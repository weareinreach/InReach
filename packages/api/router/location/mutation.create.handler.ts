import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema, ZCreateSchema } from './mutation.create.schema'

export const create = async ({ input }: TRPCHandlerParams<TCreateSchema>) => {
	try {
		const data = ZCreateSchema().dataParser.parse(input)

		const result = await prisma.orgLocation.create(data)

		return result
	} catch (error) {
		handleError(error)
	}
}
