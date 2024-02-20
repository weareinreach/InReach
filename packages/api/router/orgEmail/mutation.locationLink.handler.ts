import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLocationLinkSchema } from './mutation.locationLink.schema'

export const locationLink = async ({ ctx, input }: TRPCHandlerParams<TLocationLinkSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { action, orgEmailId, orgLocationId } = input

		switch (action) {
			case 'link': {
				const result = await prisma.orgLocationEmail.create({
					data: {
						orgEmailId,
						orgLocationId,
						active: true,
					},
				})
				return result
			}
			case 'unlink': {
				const result = await prisma.orgLocationEmail.delete({
					where: {
						orgEmailId_orgLocationId: {
							orgEmailId,
							orgLocationId,
						},
					},
				})
				return result
			}
		}
	} catch (error) {
		handleError(error)
	}
}
export default locationLink
