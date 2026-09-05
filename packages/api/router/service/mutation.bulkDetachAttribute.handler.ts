import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TBulkDetachAttributeSchema } from './mutation.bulkDetachAttribute.schema'

const bulkDetachAttribute = async ({
	ctx,
	input,
}: TRPCHandlerParams<TBulkDetachAttributeSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const result = await prisma.attributeSupplement.deleteMany({
		where: { attributeId: input.attributeId, serviceId: { in: input.serviceIds } },
	})
	return { removed: result.count }
}
export default bulkDetachAttribute
