import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGovDistsByCountrySchema } from './query.govDistsByCountry.schema'

export const govDistsByCountry = async ({ input }: TRPCHandlerParams<TGovDistsByCountrySchema>) => {
	try {
		const data = await prisma.country.findMany({
			where: {
				cca2: input?.cca2,
				activeForOrgs: input?.activeForOrgs ?? undefined,
				activeForSuggest: input?.activeForSuggest ?? undefined,
			},
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				cca2: true,
				flag: true,
				govDist: {
					where: { isPrimary: true },
					select: {
						id: true,
						tsKey: true,
						tsNs: true,
						abbrev: true,
						govDistType: {
							select: { tsKey: true, tsNs: true },
						},
						subDistricts: {
							select: {
								id: true,
								tsKey: true,
								tsNs: true,
								govDistType: {
									select: { tsKey: true, tsNs: true },
								},
								subDistricts: {
									select: {
										id: true,
										tsKey: true,
										tsNs: true,
										govDistType: {
											select: { tsKey: true, tsNs: true },
										},
									},
									orderBy: { name: 'asc' },
								},
							},
							orderBy: { name: 'asc' },
						},
					},
					orderBy: { name: 'asc' },
				},
			},
			orderBy: {
				cca2: 'asc',
			},
		})
		return data
	} catch (error) {
		handleError(error)
	}
}
