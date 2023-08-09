import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateManySchema, ZCreateManySchema } from './mutation.createMany.schema'

export const createMany = async ({ ctx, input }: TRPCHandlerParams<TCreateManySchema, 'protected'>) => {
	const inputData = {
		actorId: ctx.session.user.id,
		operation: 'CREATE',
		data: input,
	}
	const { orgHours, auditLogs } = ZCreateManySchema().dataParser.parse(inputData)
	const results = await prisma.$transaction(async (tx) => {
		const hours = await tx.orgHours.createMany(orgHours)
		const logs = await tx.auditLog.createMany(auditLogs)

		return { orgHours: hours.count, auditLogs: logs.count, balanced: hours.count === logs.count }
	})
	return results
}
