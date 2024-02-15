import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TOrgBadgesSchema } from './query.orgBadges.schema'

export const orgBadges = async ({ input }: TRPCHandlerParams<TOrgBadgesSchema>) => {
	try {
		const badges = await prisma.attribute.findMany({
			where: {
				active: true,
				categories: { some: { category: { tag: input.badgeType } } },
			},
			select: {
				id: true,
				icon: true,
				iconBg: true,
				tsKey: true,
				tsNs: true,
			},
		})
		return badges
	} catch (error) {
		handleError(error)
	}
}
export default orgBadges
