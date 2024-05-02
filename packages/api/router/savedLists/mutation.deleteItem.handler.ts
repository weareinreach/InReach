import { getAuditedClient, isIdFor } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteItemSchema } from './mutation.deleteItem.schema'

const deleteItem = async ({ ctx, input }: TRPCHandlerParams<TDeleteItemSchema, 'protected'>) => {
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
							delete: {
								listId_organizationId: {
									listId: id,
									organizationId: itemId,
								},
							},
						},
					}
				: {
						services: {
							delete: {
								listId_serviceId: {
									listId: id,
									serviceId: itemId,
								},
							},
						},
					}),
		},
		select: {
			id: true,
			name: true,
			organizations: {
				select: { organizationId: true },
			},
			services: {
				select: { serviceId: true },
			},
		},
	})
	const flattenedResult = {
		...result,
		organizations: result.organizations.map((x) => x.organizationId),
		services: result.services.map((x) => x.serviceId),
	}
	return flattenedResult
}
export default deleteItem
