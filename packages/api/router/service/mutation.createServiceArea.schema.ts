import flush from 'just-flush'
import { z } from 'zod'

import { generateId, Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateServiceAreaSchema = z
	.object({
		organizationId: prefixedId('organization').optional(),
		orgServiceId: prefixedId('orgService').optional(),
		orgLocationId: prefixedId('orgLocation').optional(),
		countries: z.string().array().optional(),
		districts: z.string().array().optional(),
	})

	.transform((parsedData) => {
		const id = generateId('serviceArea')
		const { orgLocationId, orgServiceId, organizationId } = parsedData

		const serviceAreaData = { id, orgLocationId, orgServiceId, organizationId }
		const serviceArea = Prisma.validator<Prisma.ServiceAreaCreateArgs>()({
			data: serviceAreaData,
		})

		const serviceAreaCountry: Prisma.ServiceAreaCountryUncheckedCreateInput[] | undefined = parsedData
			.countries?.length
			? parsedData.countries.map((countryId) => {
					return { serviceAreaId: id, countryId }
				})
			: undefined
		const serviceAreaDist: Prisma.ServiceAreaDistUncheckedCreateInput[] | undefined = parsedData.districts
			?.length
			? parsedData.districts.map((govDistId) => {
					return { serviceAreaId: id, govDistId }
				})
			: undefined

		return { serviceArea, serviceAreaCountry, serviceAreaDist }
	})
	.refine((data) => {
		const keys = Object.keys(flush(data))
		const ids = ['organizationId', 'orgServiceId', 'orgLocationId']
		const areas = ['countries', 'districts']
		return keys.some((key) => ids.includes(key)) && keys.some((key) => areas.includes(key))
	})
export type TCreateServiceAreaSchema = z.infer<typeof ZCreateServiceAreaSchema>
