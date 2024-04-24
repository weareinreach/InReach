import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCcaMapSchema } from './query.ccaMap.schema'

export const ccaMap = async ({ input }: TRPCHandlerParams<TCcaMapSchema>) => {
	try {
		const data = await prisma.country.findMany({
			where: input.activeForOrgs
				? {
						activeForOrgs: input.activeForOrgs ?? true,
					}
				: {},
			select: {
				id: true,
				cca2: true,
			},
		})
		const byId = new Map(data.map(({ id, cca2 }) => [id, cca2]))
		const byCCA = new Map(data.map(({ id, cca2 }) => [cca2, id]))

		return { byId, byCCA }
	} catch (error) {
		return handleError(error)
	}
}
export default ccaMap
