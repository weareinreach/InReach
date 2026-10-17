import { getAuditedClient } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUnShareUrlSchema } from './mutation.unShareUrl.schema'

const unShareUrl = async ({ ctx, input }: TRPCHandlerParams<TUnShareUrlSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		await checkListOwnership({ listId: input.id, userId: ctx.session.user.id })

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
	} catch (error) {
		return handleError(error)
	}
}
export default unShareUrl
