import { getAuditedClient, isIdFor } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSaveItemSchema } from './mutation.saveItem.schema'

export const saveItem = async ({ ctx, input }: TRPCHandlerParams<TSaveItemSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, itemId } = input

	checkListOwnership({ listId: id, userId: ctx.session.user.id })

	const result = await prisma.userSavedList.update({
		where: {
			id,
			ownedById: ctx.session.user.id,
		},
		data: {
			...(isIdFor('organization', itemId)
				? {
						organizations: {
							create: {
								organizationId: itemId,
							},
						},
					}
				: {
						services: {
							create: {
								serviceId: itemId,
							},
						},
					}),
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
export default saveItem
