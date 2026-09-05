import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TBulkDetachTagsSchema } from './mutation.bulkDetachTags.schema'

const bulkDetachTags = async ({ ctx, input }: TRPCHandlerParams<TBulkDetachTagsSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const result = await prisma.orgServiceTag.deleteMany({
		where: { serviceId: { in: input.serviceIds }, tagId: input.tagId },
	})
	return { removed: result.count }
}
export default bulkDetachTags
