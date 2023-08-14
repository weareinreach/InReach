import flush from 'just-flush'

import { prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateEmailDataSchema } from './mutation.updateEmailData.schema'

export const updateEmailData = async ({
	ctx,
	input,
}: TRPCHandlerParams<TUpdateEmailDataSchema, 'protected'>) => {
	const updates = input.map(({ id, from, to }) => {
		const { serviceOnly, locationOnly, locations, services, published } = to
		const auditLogs = CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from, to: flush(to) })
		return prisma.orgEmail.update({
			where: { id },
			data: {
				serviceOnly,
				locationOnly,
				published,
				locations: {
					createMany: locations.add?.length
						? { data: locations.add.map((orgLocationId) => ({ orgLocationId })), skipDuplicates: true }
						: undefined,
					deleteMany: locations.del?.length ? { orgLocationId: { in: locations.del } } : undefined,
				},
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
}
