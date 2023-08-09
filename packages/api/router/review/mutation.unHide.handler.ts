import { prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUnHideSchema } from './mutation.unHide.schema'

export const unHide = async ({ ctx, input }: TRPCHandlerParams<TUnHideSchema, 'protected'>) => {
	const visible = true

	const result = await prisma.orgReview.update({
		where: { id: input.id },
		data: {
			visible,
			auditLogs: CreateAuditLog({
				actorId: ctx.actorId,
				operation: 'UPDATE',
				from: { visible: !visible },
				to: { visible },
			}),
		},
		select: {
			id: true,
			visible: true,
		},
	})
	return result
}
