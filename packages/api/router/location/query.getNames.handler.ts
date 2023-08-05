import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNamesSchema } from './query.getNames.schema'

export const getNames = async ({ input }: TRPCHandlerParams<TGetNamesSchema>) => {
	try {
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
	} catch (error) {
		handleError(error)
	}
}
