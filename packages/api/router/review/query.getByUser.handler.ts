import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByUserSchema } from './query.getByUser.schema'

export const getByUser = async ({ input }: TRPCHandlerParams<TGetByUserSchema, 'protected'>) => {
	try {
		const reviews = await prisma.orgReview.findMany({
			where: {
				userId: input.userId,
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
