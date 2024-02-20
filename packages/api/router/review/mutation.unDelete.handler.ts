import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUnDeleteSchema } from './mutation.unDelete.schema'

export const unDelete = async ({ ctx, input }: TRPCHandlerParams<TUnDeleteSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const deleted = false

	const result = await prisma.orgReview.update({
		where: { id: input.id },
		data: {
			deleted,
		},
		select: {
			id: true,
			deleted: true,
		},
	})
	return result
}
export default unDelete
