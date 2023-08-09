import { prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const { where, data } = input
	const updatedRecord = await prisma.$transaction(async (tx) => {
		const current = await tx.orgService.findUniqueOrThrow({ where })
		const updated = await tx.orgService.update({
			where,
			data: {
				...data,
				auditLogs: CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from: current, to: data }),
			},
		})
		return updated
	})
	return updatedRecord
}
