import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServicesCountByCategoryCountrySchema } from './query.getServicesCountByCategoryCountry.schema'

interface OrganizationsCountryCountsRow {
	'Service Category': string
	'United States': string
	Canada: string
	Mexico: string
	Other: string
}

const getServicesCountByCategoryCountry = async (
	_params: TRPCHandlerParams<TGetServicesCountByCategoryCountrySchema>
) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."ServicesCountByCountCategoryByCountry";`
	)
	return results
}

export default getServicesCountByCategoryCountry
