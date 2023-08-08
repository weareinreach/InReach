import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getCurrentUser = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	try {
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
	} catch (error) {
		handleError(error)
	}
}
