import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getServFocusBadges = async ({ ctx }: TRPCHandlerParams<undefined>) => {
	try {
		const badges = await prisma.attribute.findMany({
			where: {
				active: true,
				categories: { some: { category: { tag: 'service-focus' } } },
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
