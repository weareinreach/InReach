import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAllForRecordSchema } from './query.getAllForRecord.schema'

const getAllForRecord = ({ input }: TRPCHandlerParams<TGetAllForRecordSchema, 'protected'>) => {
	return prisma.internalNote.findMany({
		where: input,
		include: {
			user: {
				select: {
					name: true,
				},
			},
		},
	})
}
export default getAllForRecord
