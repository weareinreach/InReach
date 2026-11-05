import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { redactReviewFieldVisibility, visibleReviewSelect } from './lib/reviewSelect'
import { type TGetByOrgSchema } from './query.getByOrg.schema'

const getByOrg = async ({ input }: TRPCHandlerParams<TGetByOrgSchema>) => {
	const reviews = await prisma.orgReview.findMany({
		where: {
			organizationId: input.orgId,
			visible: true,
			deleted: false,
		},
		select: visibleReviewSelect,
	})
	return reviews.map(redactReviewFieldVisibility)
}
export default getByOrg
