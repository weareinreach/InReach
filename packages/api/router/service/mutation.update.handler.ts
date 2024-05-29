import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const updated = await prisma.orgService.update(input)
	return updated
}
export default update
