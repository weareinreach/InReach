import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServiceAreaSchema } from './query.getServiceArea.schema'

export const getServiceArea = async ({ ctx, input }: TRPCHandlerParams<TGetServiceAreaSchema>) => {
	try {
		const result = await prisma.serviceArea.findUnique({
			where: {
				id: input,
			},
			select: {
				id: true,
				countries: {
					select: {
						country: {
							select: { cca2: true, id: true },
						},
					},
				},
				districts: {
					select: {
						govDist: {
							select: {
								id: true,
								parent: { select: { id: true, tsKey: true, tsNs: true } },
								countryId: true,
								tsKey: true,
								tsNs: true,
							},
						},
					},
				},
			},
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
