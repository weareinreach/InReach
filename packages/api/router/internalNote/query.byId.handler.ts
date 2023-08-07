import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TByIdSchema } from './query.byId.schema'

export const byId = async ({ input }: TRPCHandlerParams<TByIdSchema, 'protected'>) => {
	try {
		const result = await prisma.internalNote.findFirstOrThrow({ where: { id: input } })
		return result
	} catch (error) {
		handleError(error)
	}
}
