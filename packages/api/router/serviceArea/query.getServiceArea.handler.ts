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
								parent: { select: { tsKey: true, tsNs: true } },
								country: { select: { cca2: true } },
								tsKey: true,
								tsNs: true,
							},
						},
					},
				},
			},
		})

		if (!result) return result

		const { id, districts, countries } = result
		const formatted = {
			id,
			districts: districts.map(({ govDist }) => govDist),
			countries: countries.map(({ country }) => country),
		}
		return formatted
	} catch (error) {
		handleError(error)
	}
}
export default getServiceArea
