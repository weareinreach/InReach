import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetPublishedOrgServicesCaliforniaSchema } from './query.getPublishedOrgServicesCalifornia.schema'

interface OrganizationsCountryCountsRow {
	category: string
	count: number
}

const getPublishedOrgServicesCalifornia = async (
	_params: TRPCHandlerParams<TGetPublishedOrgServicesCaliforniaSchema>
) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."PublishedOrgsServicesCalifornia";`
	)
	return results
}

export default getPublishedOrgServicesCalifornia
