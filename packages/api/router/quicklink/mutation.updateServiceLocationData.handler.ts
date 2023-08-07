import flush from 'just-flush'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateServiceLocationDataSchema } from './mutation.updateServiceLocationData.schema'

export const updateServiceLocationData = async ({
	ctx,
	input,
}: TRPCHandlerParams<TUpdateServiceLocationDataSchema, 'protected'>) => {
	try {
		const updates = input.map(({ id, from, to }) => {
			const { services, published } = to
			const auditLogs = CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from, to: flush(to) })
			return prisma.orgLocation.update({
				where: { id },
				data: {
					published,
					services: {
						createMany: services.add?.length
							? { data: services.add.map((serviceId) => ({ serviceId })), skipDuplicates: true }
							: undefined,
						deleteMany: services.del?.length ? { serviceId: { in: services.del } } : undefined,
					},
					auditLogs,
				},
			})
		})
		const results = await prisma.$transaction(updates)
		return results
	} catch (error) {
		handleError(error)
	}
}
