import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { redactReviewFieldVisibility, visibleReviewSelect } from './lib/reviewSelect'
import { type TGetByServiceSchema } from './query.getByService.schema'

const getByService = async ({ input }: TRPCHandlerParams<TGetByServiceSchema>) => {
	const reviews = await prisma.orgReview.findMany({
		where: {
			organizationId: input.orgId,
			orgServiceId: input.serviceId,
			visible: true,
			deleted: false,
		},
		select: visibleReviewSelect,
	})
	return reviews.map(redactReviewFieldVisibility)
}
export default getByService
