import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServicesCountByCountrySchema } from './query.getServiceCountByCountry.schema'

interface OrganizationsCountryCountsRow {
	'United States': number
	Canada: number
	Mexico: number
	Other: number
}

const getServicesCountByCountry = async (_params: TRPCHandlerParams<TGetServicesCountByCountrySchema>) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."ServicesCountByCountry";`
	)
	return results
}

export default getServicesCountByCountry
