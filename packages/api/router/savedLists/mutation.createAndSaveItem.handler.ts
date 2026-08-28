import { getAuditedClient, isIdFor } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateAndSaveItemSchema } from './mutation.createAndSaveItem.schema'

const createAndSaveItem = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateAndSaveItemSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { name, itemId } = input

	const result = await prisma.userSavedList.create({
		data: {
			name,
			ownedById: ctx.session.user.id,
			...(isIdFor('organization', itemId)
				? { organizations: { create: { organizationId: itemId } } }
				: { services: { create: { serviceId: itemId } } }),
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
