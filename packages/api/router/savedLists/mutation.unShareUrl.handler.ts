import { getAuditedClient } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUnShareUrlSchema } from './mutation.unShareUrl.schema'

export const unShareUrl = async ({ ctx, input }: TRPCHandlerParams<TUnShareUrlSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	checkListOwnership({ listId: input.id, userId: ctx.session.user.id })

	const result = await prisma.userSavedList.update({
		where: input,
		data: { sharedLinkKey: null },
		select: {
			id: true,
			name: true,
			sharedLinkKey: true,
		},
	})

	return result
}
export default unShareUrl
