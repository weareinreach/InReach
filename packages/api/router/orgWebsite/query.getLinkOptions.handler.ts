import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetLinkOptionsSchema } from './query.getLinkOptions.schema'

export const getLinkOptions = async ({ input }: TRPCHandlerParams<TGetLinkOptionsSchema>) => {
	try {
		const { slug, locationId } = input
		const result = await prisma.orgWebsite.findMany({
			where: {
				organization: { slug },
				locations: { every: { orgLocationId: { not: locationId } } },
			},
			select: {
				id: true,
				url: true,
				published: true,
				deleted: true,
				description: { select: { tsKey: { select: { text: true } } } },
			},
		})
		const transformed = result.map(({ description, ...record }) => ({
			...record,
			description: description ? description.tsKey.text : null,
		}))
		return transformed
	} catch (error) {
		return handleError(error)
	}
}
export default getLinkOptions
