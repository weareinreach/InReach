import { diff as objectDiff, type StringIndexableObject } from 'js-object-utils'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAuditLogByActorIdSchema } from './query.auditLogByActorId.schema'

export const auditLogByActorId = async ({ ctx, input }: TRPCHandlerParams<TAuditLogByActorIdSchema>) => {
	try {
		const { actorId, skip, take, sort } = input
		const auditLog = await prisma.auditTrail.findMany({
			where: { actorId },
			skip,
			take,
			orderBy: { timestamp: sort === 'new' ? 'desc' : 'asc' },
			select: {
				actorId: true,
				id: true,
				new: true,
				old: true,
				operation: true,
				recordId: true,
				table: true,
				timestamp: true,
			},
		})
		const withDiff = auditLog.map(({ new: newRecord, old: oldRecord, ...record }) => {
			const recordPrev = (
				record.operation === 'INSERT'
					? Object.fromEntries(Object.keys(newRecord as object).map((k) => [k, null]))
					: oldRecord
			) as StringIndexableObject
			const recordCurr = (
				record.operation === 'DELETE'
					? Object.fromEntries(Object.keys(oldRecord as object).map((k) => [k, null]))
					: newRecord
			) as StringIndexableObject

			const diff = objectDiff(recordPrev, recordCurr)

			return { ...record, diff }
		})
		return withDiff
	} catch (error) {
		handleError(error)
	}
}
export default auditLogByActorId