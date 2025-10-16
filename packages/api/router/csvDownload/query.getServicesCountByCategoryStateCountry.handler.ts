import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServicesCountByCategoryStateCountrySchema } from './query.getServicesCountByCategoryStateCountry.schema'

interface ServicesCountByCategoryStateCountryRow {
	country_name: string
	state_province_name: string
	category: string
	service_count: number
}

const getServicesCountByCategoryStateCountry = async (
	_params: TRPCHandlerParams<TGetServicesCountByCategoryStateCountrySchema>
) => {
	const results = await prisma.$queryRaw<ServicesCountByCategoryStateCountryRow[]>(
		Prisma.sql`SELECT * FROM public."ServicesCountByCategoryByStateByCountry";`
	)
	return results
}

export default getServicesCountByCategoryStateCountry
