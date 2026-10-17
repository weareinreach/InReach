import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TKpiBoardRegionMappingDeleteSchema } from './mutation.kpiBoardRegionMappingDelete.schema'

const kpiBoardRegionMappingDelete = async ({
	ctx,
	input,
}: TRPCHandlerParams<TKpiBoardRegionMappingDeleteSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	return prisma.kpiRegionMapping.delete({ where: { id: input.id } })
}

export default kpiBoardRegionMappingDelete
