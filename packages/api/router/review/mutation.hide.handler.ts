import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type THideSchema } from './mutation.hide.schema'

const hide = async ({ ctx, input }: TRPCHandlerParams<THideSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const visible = false

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
export default hide
