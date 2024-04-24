import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetSubDistrictsSchema } from './query.getSubDistricts.schema'

const getSubDistricts = async ({ input }: TRPCHandlerParams<TGetSubDistrictsSchema>) => {
	try {
		const results = await prisma.govDist.findMany({
			where: {
				parentId: input,
			},
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				abbrev: true,
				country: { select: { cca2: true } },
				parent: { select: { tsKey: true, tsNs: true } },
				govDistType: {
					select: { tsKey: true, tsNs: true },
				},
			},
			orderBy: {
				name: 'asc',
			},
		})
		return results
	} catch (error) {
		return handleError(error)
	}
}
export default getSubDistricts
