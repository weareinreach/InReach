import flush from 'just-flush'

import { getAuditedClient } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdatePhoneDataSchema } from './mutation.updatePhoneData.schema'

export const updatePhoneData = async ({
	ctx,
	input,
}: TRPCHandlerParams<TUpdatePhoneDataSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const updates = input.map(({ id, to }) => {
		const { serviceOnly, locationOnly, locations, services, published } = to

		return prisma.orgPhone.update({
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
			},
		})
	})
	const results = await prisma.$transaction(updates)
	return results
}
export default updatePhoneData
