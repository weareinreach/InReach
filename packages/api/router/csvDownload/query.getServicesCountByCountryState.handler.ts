import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServicesCountByCountryStateSchema } from './query.getServicesCountByCountryState.schema'

interface OrganizationsCountryCountsRow {
	country: string
	state_or_territory: string
	organization_count: number
}

const getServicesCountByCountryState = async (
	_params: TRPCHandlerParams<TGetServicesCountByCountryStateSchema>
) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."ServicesCountByCountByState";`
	)
	return results
}

export default getServicesCountByCountryState
