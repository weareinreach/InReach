import { getAuditedClient } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSaveItemSchema } from './mutation.saveItem.schema'

const saveItem = async ({ ctx, input }: TRPCHandlerParams<TSaveItemSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, organizationId, serviceId } = input

	checkListOwnership({ listId: id, userId: ctx.session.user.id })

	const result = await prisma.userSavedList.update({
		where: {
			id,
			ownedById: ctx.session.user.id,
		},
		data: {
			...(organizationId
				? {
						organizations: {
							create: {
								organizationId,
							},
						},
					}
				: {}),
			...(serviceId
				? {
						services: {
							create: {
								serviceId,
							},
						},
					}
				: {}),
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
