import { getAuditedClient } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteSchema } from './mutation.delete.schema'

export const deleteList = async ({ ctx, input }: TRPCHandlerParams<TDeleteSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	checkListOwnership({ listId: input.id, userId: ctx.session.user.id })

	const result = await prisma.userSavedList.delete({
		where: {
			id: input.id,
		},
		select: {
			id: true,
			name: true,
		},
	})
	return result
}
export default deleteList
