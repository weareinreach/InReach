import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForBadgeEditModalSchema } from './query.forBadgeEditModal.schema'

export const forBadgeEditModal = async ({ input }: TRPCHandlerParams<TForBadgeEditModalSchema>) => {
	try {
		const data = await prisma.attributeSupplement.findMany({
			where: {
				organizationId: input.id,
				attribute: { categories: { some: { category: { tag: input.badgeType } } } },
			},
			select: {
				attributeId: true,
			},
		})
		return data.map(({ attributeId }) => attributeId)
	} catch (error) {
		return handleError(error)
	}
}
export default forBadgeEditModal
