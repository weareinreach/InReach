import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetOrgCountByStateSchema } from './query.getOrgCountByState.schema'

interface OrganizationsCountryCountsRow {
	country: string
	state_or_territory: string
	organization_count: number
}

const getOrganizationsStateCounts = async (_params: TRPCHandlerParams<TGetOrgCountByStateSchema>) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."OrganizationsCountByState";`
	)
	return results
}

export default getOrganizationsStateCounts
