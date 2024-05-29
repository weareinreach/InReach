import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateServiceLocationDataSchema } from './mutation.updateServiceLocationData.schema'

const updateServiceLocationData = async ({
	ctx,
	input,
}: TRPCHandlerParams<TUpdateServiceLocationDataSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const updates = input.map(({ id, to }) => {
		const { services, published } = to
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
			},
		})
	})
	const results = await prisma.$transaction(updates)
	return results
}
export default updateServiceLocationData
