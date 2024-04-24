import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByOrgSchema } from './query.getByOrg.schema'

const getByOrg = async ({ input }: TRPCHandlerParams<TGetByOrgSchema>) => {
	const reviews = await prisma.orgReview.findMany({
		where: {
			organizationId: input.orgId,
		},
	})
	return reviews
}
export default getByOrg
