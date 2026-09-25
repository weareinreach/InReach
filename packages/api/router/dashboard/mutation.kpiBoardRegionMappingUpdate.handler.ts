import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TKpiBoardRegionMappingUpdateSchema } from './mutation.kpiBoardRegionMappingUpdate.schema'

const kpiBoardRegionMappingUpdate = async ({
	ctx,
	input: { id, ...data },
}: TRPCHandlerParams<TKpiBoardRegionMappingUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	return prisma.kpiRegionMapping.update({
		where: { id },
		data: { ...data, updatedById: ctx.actorId },
	})
}

export default kpiBoardRegionMappingUpdate
