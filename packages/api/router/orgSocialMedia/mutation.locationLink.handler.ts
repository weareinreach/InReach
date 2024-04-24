import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLocationLinkSchema } from './mutation.locationLink.schema'

const locationLink = async ({ ctx, input }: TRPCHandlerParams<TLocationLinkSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { action, orgSocialMediaId, orgLocationId } = input

		switch (action) {
			case 'link': {
				const result = await prisma.orgLocationSocialMedia.create({
					data: {
						orgLocationId,
						socialMediaId: orgSocialMediaId,
						active: true,
					},
				})
				return result
			}
			case 'unlink': {
				const result = await prisma.orgLocationSocialMedia.delete({
					where: {
						orgLocationId_socialMediaId: {
							socialMediaId: orgSocialMediaId,
							orgLocationId,
						},
					},
				})
				return result
			}
			default: {
				throw new Error('Invalid action')
			}
		}
	} catch (error) {
		return handleError(error)
	}
}
export default locationLink
