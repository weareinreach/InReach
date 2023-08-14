import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getCurrentUser = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	const reviews = await prisma.orgReview.findMany({
		where: {
			userId: ctx.session.user.id,
		},
		include: {
			organization: true,
			orgLocation: true,
			orgService: true,
		},
	})
	return reviews
}
