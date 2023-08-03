import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getFilterOptions = async (ctx: TRPCHandlerParams) => {
	try {
		const result = await prisma.attribute.findMany({
			where: {
				AND: {
					filterType: {
						not: null,
					},
					active: true,
				},
			},
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				filterType: true,
			},
			orderBy: {
				tsKey: 'asc',
			},
		})

		return result
	} catch (error) {
		handleError(error)
	}
}
