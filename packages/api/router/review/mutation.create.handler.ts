import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const review = await prisma.orgReview.create({
		data: {
			...input,
			userId: ctx.session.user.id,
		},
		select: { id: true },
	})

	return review
}
export default create
