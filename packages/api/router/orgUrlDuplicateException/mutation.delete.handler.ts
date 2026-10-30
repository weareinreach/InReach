import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteSchema } from './mutation.delete.schema'

/** Soft delete - flips `active` to false. See `mutation.unDelete` for the reverse. */
const deleteException = async ({ ctx, input }: TRPCHandlerParams<TDeleteSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	return prisma.orgUrlDuplicateException.update({
		where: { id: input.id },
		data: { active: false },
		select: { id: true, active: true },
	})
}
export default deleteException
