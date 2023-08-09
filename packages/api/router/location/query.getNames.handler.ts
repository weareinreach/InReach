import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNamesSchema } from './query.getNames.schema'

export const getNames = async ({ input }: TRPCHandlerParams<TGetNamesSchema>) => {
	const results = await prisma.orgLocation.findMany({
		where: {
			organization: { id: input.organizationId },
		},
		select: {
			id: true,
			name: true,
		},
	})

	return results
}
