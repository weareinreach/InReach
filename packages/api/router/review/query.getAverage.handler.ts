import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAverageSchema } from './query.getAverage.schema'

const getAverage = async ({ input }: TRPCHandlerParams<TGetAverageSchema>) => {
	const whereId = (): Prisma.OrgReviewWhereInput => {
		switch (true) {
			case isIdFor('organization', input): {
				return { organizationId: input }
			}
			case isIdFor('orgLocation', input): {
				return { orgLocationId: input }
			}
			case isIdFor('orgService', input): {
				return { orgServiceId: input }
			}
			default: {
				return {}
			}
		}
	}

	const result = await prisma.orgReview.aggregate({
		_avg: {
			rating: true,
		},
		_count: {
			rating: true,
		},
		// Previously no visible/deleted filter at all - the average/count included hidden and soft-deleted
		// reviews, and the endpoint could be probed with a hidden org/location/service id to confirm reviews
		// exist for it. Same review-level filter already used by getByOrg/getByLocation/getByService.
		where: { ...whereId(), visible: true, deleted: false },
	})
	return { average: result._avg.rating, count: result._count.rating }
}
export default getAverage
