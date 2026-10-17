import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TKpiBoardRegionMappingCreateSchema } from './mutation.kpiBoardRegionMappingCreate.schema'

const kpiBoardRegionMappingCreate = async ({
	ctx,
	input,
}: TRPCHandlerParams<TKpiBoardRegionMappingCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	return prisma.kpiRegionMapping.create({
		data: { ...input, updatedById: ctx.actorId },
	})
}

export default kpiBoardRegionMappingCreate
