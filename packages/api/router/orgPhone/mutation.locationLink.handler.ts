import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLocationLinkSchema } from './mutation.locationLink.schema'

export const locationLink = async ({ ctx, input }: TRPCHandlerParams<TLocationLinkSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { action, orgPhoneId, orgLocationId } = input

		switch (action) {
			case 'link': {
				const result = await prisma.orgLocationPhone.create({
					data: {
						phoneId: orgPhoneId,
						orgLocationId,
						active: true,
					},
				})
				return result
			}
			case 'unlink': {
				const result = await prisma.orgLocationPhone.delete({
					where: {
						orgLocationId_phoneId: {
							phoneId: orgPhoneId,
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
