import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByUserSchema } from './query.getByUser.schema'

export const getByUser = async ({ input }: TRPCHandlerParams<TGetByUserSchema, 'protected'>) => {
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
}
