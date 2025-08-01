import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServicesCountByCountryAttributeSchema } from './query.getServicesCountByCountryAttribute.schema'

interface OrganizationsCountryCountsRow {
	Attribute: string
	'United States': number
	Canada: number
	Mexico: number
	Other: number
}

const getServicesCountByCountryAttribute = async (
	_params: TRPCHandlerParams<TGetServicesCountByCountryAttributeSchema>
) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."ServicesCountByCountryAttribute";`
	)
	return results
}

export default getServicesCountByCountryAttribute
