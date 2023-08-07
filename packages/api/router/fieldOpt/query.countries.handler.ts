import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCountriesSchema } from './query.countries.schema'

export const countries = async ({ input }: TRPCHandlerParams<TCountriesSchema>) => {
	try {
		const { where } = input ?? {}
		const result = await prisma.country.findMany({
			where,
			select: {
				id: true,
				cca2: true,
				name: true,
				dialCode: true,
				flag: true,
				tsKey: true,
				tsNs: true,
				activeForOrgs: true,
			},
			orderBy: {
				name: 'asc',
			},
		})
		type CountryResult = (typeof result)[number][]
		return result as CountryResult
	} catch (error) {
		handleError(error)
	}
}
