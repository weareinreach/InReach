import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateAndSaveItemSchema } from './mutation.createAndSaveItem.schema'

export const createAndSaveItem = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateAndSaveItemSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const result = await prisma.userSavedList.create({
		data: {
			...input,
			ownedById: ctx.session.user.id,
		},
		select: {
			services: { select: { serviceId: true } },
			organizations: { select: { organizationId: true } },
			id: true,
		},
	})

	const flattenedResult = {
		...result,
		organizations: result.organizations.map((x) => x.organizationId),
		services: result.services.map((x) => x.serviceId),
	}
	return flattenedResult
}
export default createAndSaveItem
