import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGovDistsSchema } from './query.govDists.schema'

export const govDists = async ({ input }: TRPCHandlerParams<TGovDistsSchema>) => {
	try {
		console.log(input)
		const results = await prisma.govDist.findMany({
			where: input,
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				abbrev: true,
				country: { select: { cca2: true } },
				govDistType: { select: { tsKey: true, tsNs: true } },
			},
		})
		return results
	} catch (error) {
		handleError(error)
	}
}
