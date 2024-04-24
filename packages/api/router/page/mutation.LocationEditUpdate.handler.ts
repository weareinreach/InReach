import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLocationEditUpdateSchema } from './mutation.LocationEditUpdate.schema'

const LocationEditUpdate = async ({
	ctx,
	input,
}: TRPCHandlerParams<TLocationEditUpdateSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { id, name, services } = input
		const updated = await prisma.orgLocation.update({
			where: { id },
			data: {
				name,
				services: {
					...(services.createdVals
						? { createMany: { data: services.createdVals.map((serviceId) => ({ serviceId, active: true })) } }
						: {}),
					...(services.deletedVals ? { deleteMany: { serviceId: { in: services.deletedVals } } } : {}),
				},
			},
			select: {
				id: true,
			},
		})
		return updated
	} catch (error) {
		return handleError(error)
	}
}
export default LocationEditUpdate
