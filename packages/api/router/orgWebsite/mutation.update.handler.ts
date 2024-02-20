import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const { where, data } = input
	const prisma = getAuditedClient(ctx.actorId)
	const updated = await prisma.orgWebsite.update({
		where,
		data,
	})
	return updated
}
export default update
