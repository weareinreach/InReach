import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { redactReviewFieldVisibility, visibleReviewSelect } from './lib/reviewSelect'
import { type TGetByIdsSchema } from './query.getByIds.schema'

const getByIds = async ({ input }: TRPCHandlerParams<TGetByIdsSchema>) => {
	const results = await prisma.orgReview.findMany({
		where: {
			id: {
				in: input,
			},
			visible: true,
			deleted: false,
		},
		select: visibleReviewSelect,
	})

	return results.map(redactReviewFieldVisibility)
}
export default getByIds
