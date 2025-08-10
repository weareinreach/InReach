import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAllForRecordSchema } from './query.getAllForRecord.schema'

const getAllForRecord = async ({ input }: TRPCHandlerParams<TGetAllForRecordSchema, 'protected'>) => {
	console.log('getting notes for record', input)
	const results = prisma.internalNote.findMany({
		where: input,
		include: {
			user: {
				select: {
					name: true,
				},
			},
		},
	})
	console.log('got stuff')
	return results
}
export default getAllForRecord
