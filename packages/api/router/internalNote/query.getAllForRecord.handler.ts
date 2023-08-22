import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAllForRecordSchema } from './query.getAllForRecord.schema'

export const getAllForRecord = async ({ input }: TRPCHandlerParams<TGetAllForRecordSchema, 'protected'>) => {
	const results = prisma.internalNote.findMany({ where: input })
	return results
}
