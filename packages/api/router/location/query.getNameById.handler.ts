import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNameByIdSchema } from './query.getNameById.schema'

export const getNameById = async ({ input }: TRPCHandlerParams<TGetNameByIdSchema>) => {
	try {
		const result = await prisma.orgLocation.findUniqueOrThrow({
			where: { id: input },
			select: { name: true },
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
