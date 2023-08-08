import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type THideSchema } from './mutation.hide.schema'

export const hide = async ({ ctx, input }: TRPCHandlerParams<THideSchema, 'protected'>) => {
	try {
		const visible = false

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
	} catch (error) {
		handleError(error)
	}
}
