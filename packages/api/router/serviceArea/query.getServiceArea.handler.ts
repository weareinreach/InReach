import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServiceAreaSchema } from './query.getServiceArea.schema'

const getServiceArea = async ({ input }: TRPCHandlerParams<TGetServiceAreaSchema>) => {
	try {
		const result = await prisma.serviceArea.findUnique({
			where: {
				id: input,
				active: true,
				// Exactly one of organization/orgLocation/orgService is ever set on a given row - whichever
				// one it is must itself be published and not deleted (and, for a location/service, its parent
				// org too), or this leaked whether a hidden org/location/service exists by still returning its
				// service area data.
				OR: [
					{ organization: { is: { published: true, deleted: false } } },
					{
						orgLocation: {
							is: { published: true, deleted: false, organization: { published: true, deleted: false } },
						},
					},
					{
						orgService: {
							is: { published: true, deleted: false, organization: { published: true, deleted: false } },
						},
					},
				],
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

		if (!result) {
			return result
		}

		const { id, districts, countries } = result
		const formatted = {
			id,
			districts: districts.map(({ govDist }) => govDist),
			countries: countries.map(({ country }) => country),
		}
		return formatted
	} catch (error) {
		return handleError(error)
	}
}
export default getServiceArea
