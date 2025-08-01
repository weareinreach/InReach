import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetOrgCountByCountryAttributeSchema } from './query.getOrgCountByCountryAttribute.schema'

interface OrganizationsCountryCountsRow {
	attribute: string
	'United States': number
	Canada: number
	Mexico: number
	Other: number
}

const getOrgCountByCountryAttribute = async (
	_params: TRPCHandlerParams<TGetOrgCountByCountryAttributeSchema>
) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."OrganizationsCountryCountsByAttribute";`
	)
	return results
}

export default getOrgCountByCountryAttribute
