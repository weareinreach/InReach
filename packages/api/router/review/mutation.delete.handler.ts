import { prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteSchema } from './mutation.delete.schema'

export const deleteReview = async ({ ctx, input }: TRPCHandlerParams<TDeleteSchema, 'protected'>) => {
	const deleted = true

	const result = await prisma.orgReview.update({
		where: { id: input.id },
		data: {
			deleted,
			auditLogs: CreateAuditLog({
				actorId: ctx.actorId,
				operation: 'UPDATE',
				from: { deleted: !deleted },
				to: { deleted: deleted },
			}),
		},
		select: {
			id: true,
			deleted: true,
		},
	})
	return result
}
