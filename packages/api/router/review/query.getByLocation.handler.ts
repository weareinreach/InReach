import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByLocationSchema } from './query.getByLocation.schema'

const getByLocation = async ({ input }: TRPCHandlerParams<TGetByLocationSchema>) => {
	const reviews = await prisma.orgReview.findMany({
		where: {
			organizationId: input.orgId,
			orgLocationId: input.locationId,
		},
	})
	return reviews
}
export default getByLocation
