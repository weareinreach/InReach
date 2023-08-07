import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAllForRecordSchema } from './query.getAllForRecord.schema'

export const getAllForRecord = async ({ input }: TRPCHandlerParams<TGetAllForRecordSchema, 'protected'>) => {
	try {
		const results = prisma.internalNote.findMany({ where: input })
		return results
	} catch (error) {
		handleError(error)
	}
}
