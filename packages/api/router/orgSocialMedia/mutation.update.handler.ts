import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const { where, data } = input
	const prisma = getAuditedClient(ctx.actorId)

	const updated = await prisma.orgSocialMedia.update({
		where,
		data,
		select: {
			id: true,
			username: true,
			url: true,
			deleted: true,
			published: true,
			serviceId: true,
			organizationId: true,
			orgLocationId: true,
			orgLocationOnly: true,
			service: {
				select: { id: true, name: true, logoIcon: true },
			},
		},
	})
	return updated
}
export default update
