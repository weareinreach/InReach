import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUnHideSchema } from './mutation.unHide.schema'

export const unHide = async ({ ctx, input }: TRPCHandlerParams<TUnHideSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const visible = true

	const result = await prisma.orgReview.update({
		where: { id: input.id },
		data: {
			visible,
		},
		select: {
			id: true,
			visible: true,
		},
	})
	return result
}
export default unHide
