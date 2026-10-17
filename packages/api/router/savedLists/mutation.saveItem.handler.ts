import { getAuditedClient, isIdFor } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSaveItemSchema } from './mutation.saveItem.schema'

const saveItem = async ({ ctx, input }: TRPCHandlerParams<TSaveItemSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { id, itemId } = input

		await checkListOwnership({ listId: id, userId: ctx.session.user.id })

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
	} catch (error) {
		return handleError(error)
	}
}
export default saveItem
