import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { redactReviewFieldVisibility, visibleReviewSelect } from './lib/reviewSelect'
import { type TGetByLocationSchema } from './query.getByLocation.schema'

const getByLocation = async ({ input }: TRPCHandlerParams<TGetByLocationSchema>) => {
	const reviews = await prisma.orgReview.findMany({
		where: {
			organizationId: input.orgId,
			orgLocationId: input.locationId,
			visible: true,
			deleted: false,
		},
		select: visibleReviewSelect,
	})
	return reviews.map(redactReviewFieldVisibility)
}
export default getByLocation
