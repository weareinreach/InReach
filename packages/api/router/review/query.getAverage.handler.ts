import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAverageSchema } from './query.getAverage.schema'

export const getAverage = async ({ input }: TRPCHandlerParams<TGetAverageSchema>) => {
	try {
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
			where: whereId(),
		})
		return { average: result._avg.rating, count: result._count.rating }
	} catch (error) {
		handleError(error)
	}
}
