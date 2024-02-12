import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetLinkOptionsSchema } from './query.getLinkOptions.schema'

export const getLinkOptions = async ({ ctx, input }: TRPCHandlerParams<TGetLinkOptionsSchema>) => {
	try {
		const { slug, locationId } = input
		const result = await prisma.orgSocialMedia.findMany({
			where: {
				organization: { slug },
				locations: { every: { orgLocationId: { not: locationId } } },
			},
			select: {
				id: true,
				url: true,
				published: true,
				deleted: true,
				service: { select: { name: true, logoIcon: true } },
			},
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
export default getLinkOptions
