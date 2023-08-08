import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByOrgSchema } from './query.getByOrg.schema'

export const getByOrg = async ({ input }: TRPCHandlerParams<TGetByOrgSchema>) => {
	try {
		const reviews = await prisma.orgReview.findMany({
			where: {
				organizationId: input.orgId,
			},
		})
		return reviews
	} catch (error) {
		handleError(error)
	}
}
