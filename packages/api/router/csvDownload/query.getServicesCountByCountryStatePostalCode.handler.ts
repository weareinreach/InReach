import { Prisma } from '@prisma/client'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServicesCountByCountryStatePostalCodeSchema } from './query.getServicesCountByCountryStatePostalCode.schema'

interface ServicesCountByZipcodeRow {
	category: string
	postal_code: string // Now guaranteed to be a string due to COALESCE in view
	state_province_name: string // Now guaranteed to be a string due to COALESCE in view
	country_name: string
	service_count: number
}

const getServicesCountByCountryStatePostalCode = async (
	_params: TRPCHandlerParams<TGetServicesCountByCountryStatePostalCodeSchema>
) => {
	const results = await prisma.$queryRaw<ServicesCountByZipcodeRow[]>(
		Prisma.sql`SELECT * FROM public."ServicesCountByCategoryByStateByPostalCode";`
	)
	return results.map((row) => ({
		'Service Category': row.category,
		'ZIP Code': row.postal_code,
		State: row.state_province_name,
		Country: row.country_name,
		'Count of Services': Number(row.service_count),
	}))
}

export default getServicesCountByCountryStatePostalCode
