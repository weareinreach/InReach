import { prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const { where, data } = input
	const updatedRecord = await prisma.$transaction(async (tx) => {
		const current = await tx.orgLocation.findUniqueOrThrow({ where })
		const auditLog = CreateAuditLog({
			actorId: ctx.session!.user.id,
			operation: 'UPDATE',
			from: current,
			to: data,
		})
		const update = await tx.orgLocation.update({
			where,
			data: { ...data, auditLogs: auditLog },
			select: { id: true },
		})

		return update
	})
	return updatedRecord
}
