import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByServiceSchema } from './query.getByService.schema'

export const getByService = async ({ input }: TRPCHandlerParams<TGetByServiceSchema>) => {
	try {
		const reviews = await prisma.orgReview.findMany({
			where: {
				organizationId: input.orgId,
				orgServiceId: input.serviceId,
			},
		})
		return reviews
	} catch (error) {
		handleError(error)
	}
}
