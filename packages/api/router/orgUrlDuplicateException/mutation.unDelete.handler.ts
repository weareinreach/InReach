import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUnDeleteSchema } from './mutation.unDelete.schema'

/** Reverses `mutation.delete` - flips `active` back to true. */
const unDelete = async ({ ctx, input }: TRPCHandlerParams<TUnDeleteSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	return prisma.orgUrlDuplicateException.update({
		where: { id: input.id },
		data: { active: true },
		select: { id: true, active: true },
	})
}
export default unDelete
