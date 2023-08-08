import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByLocationSchema } from './query.getByLocation.schema'

export const getByLocation = async ({ input }: TRPCHandlerParams<TGetByLocationSchema>) => {
	try {
		const reviews = await prisma.orgReview.findMany({
			where: {
				organizationId: input.orgId,
				orgLocationId: input.locationId,
			},
		})
		return reviews
	} catch (error) {
		handleError(error)
	}
}
