import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteSchema } from './mutation.delete.schema'

const deleteReview = async ({ ctx, input }: TRPCHandlerParams<TDeleteSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const deleted = true

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
export default deleteReview
