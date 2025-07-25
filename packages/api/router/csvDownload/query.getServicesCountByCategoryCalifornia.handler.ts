import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServicesCountByCategoryCaliforniaSchema } from './query.getServicesCountByCategoryCalifornia.schema'

interface OrganizationsCountryCountsRow {
	category: string
	count: number
}

const getServicesCountByCategoryCalifornia = async (
	_params: TRPCHandlerParams<TGetServicesCountByCategoryCaliforniaSchema>
) => {
	const results = await prisma.$queryRaw<OrganizationsCountryCountsRow[]>(
		Prisma.sql`SELECT * FROM public."ServicesCountByCategoryCalifornia";`
	)
	return results
}

export default getServicesCountByCategoryCalifornia
