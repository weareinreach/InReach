import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetOrgCountByCountrySchema } from './query.getOrgCountByCountry.schema'

interface OrganizationsCountryCountsRow {
	'United States': number
	Canada: number
	Mexico: number
	Other: number
}

const getOrganizationsCountryCounts = async (_params: TRPCHandlerParams<TGetOrgCountByCountrySchema>) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."OrganizationsCountryCounts";`
	)
	return results
}

export default getOrganizationsCountryCounts
