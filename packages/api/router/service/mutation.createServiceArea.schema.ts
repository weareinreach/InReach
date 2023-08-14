import flush from 'just-flush'
import { z } from 'zod'

import { generateId, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateServiceAreaSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
			organizationId: prefixedId('organization').optional(),
			orgServiceId: prefixedId('orgService').optional(),
			orgLocationId: prefixedId('orgLocation').optional(),
			countries: z.string().array().optional(),
			districts: z.string().array().optional(),
		})
	)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLog: Prisma.AuditLogUncheckedCreateInput[] = []
		const id = generateId('serviceArea')
		const { orgLocationId, orgServiceId, organizationId } = parsedData

		const serviceAreaData = { id, orgLocationId, orgServiceId, organizationId }
		const serviceArea = Prisma.validator<Prisma.ServiceAreaCreateArgs>()({
			data: serviceAreaData,
		})
		auditLog.push(GenerateAuditLog({ actorId, operation: 'CREATE', to: serviceAreaData }))
		const serviceAreaCountry: Prisma.ServiceAreaCountryUncheckedCreateInput[] | undefined = parsedData
			.countries?.length
			? parsedData.countries.map((countryId) => {
					auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', serviceAreaId: id, countryId }))
					return { serviceAreaId: id, countryId }
			  })
			: undefined
		const serviceAreaDist: Prisma.ServiceAreaDistUncheckedCreateInput[] | undefined = parsedData.districts
			?.length
			? parsedData.districts.map((govDistId) => {
					auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', serviceAreaId: id, govDistId }))
					return { serviceAreaId: id, govDistId }
			  })
			: undefined

		return { serviceArea, auditLog, serviceAreaCountry, serviceAreaDist }
	})
	return {
		dataParser,
		inputSchema: inputSchema.refine((data) => {
			const keys = Object.keys(flush(data))
			const ids = ['organizationId', 'orgServiceId', 'orgLocationId']
			const areas = ['countries', 'districts']
			return keys.some((key) => ids.includes(key)) && keys.some((key) => areas.includes(key))
		}),
	}
}
export type TCreateServiceAreaSchema = z.infer<ReturnType<typeof ZCreateServiceAreaSchema>['inputSchema']>
