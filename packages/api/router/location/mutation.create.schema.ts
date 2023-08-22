import { z } from 'zod'

import { createGeoFields, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { AuditLogSchema } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'
import { createManyRequired } from '~api/schemas/nestedOps'

export const ZCreateSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
			orgId: prefixedId('organization'),
			id: prefixedId('orgLocation').optional(),
			name: z.string().optional(),
			street1: z.string(),
			street2: z.string().optional(),
			city: z.string(),
			postCode: z.string().optional(),
			primary: z.boolean().optional(),
			govDistId: z.string(),
			countryId: z.string(),
			longitude: z.number(),
			latitude: z.number(),
			published: z.boolean().default(false),
			emails: z
				.object({ orgEmailId: prefixedId('orgEmail') })
				.array()
				.optional(),
			phones: z
				.object({ phoneId: prefixedId('orgPhone') })
				.array()
				.optional(),
			services: z
				.object({ serviceId: prefixedId('orgService') })
				.array()
				.optional(),
		})
	)
	const dataParser = parser.transform(({ actorId, data }) => {
		const { emails, phones, services, ...dataTo } = data
		const linkAuditLogs: Prisma.AuditLogUncheckedCreateWithoutOrgLocationInput[] = []
		const serviceLinks = (
			!services
				? undefined
				: createManyRequired(
						services.map(({ serviceId }) => {
							linkAuditLogs.push(AuditLogSchema.parse({ actorId, operation: 'LINK', serviceId }))
							return { serviceId }
						})
				  )
		) satisfies Prisma.OrgLocationServiceCreateNestedManyWithoutLocationInput | undefined

		const emailLinks = (
			!emails
				? undefined
				: createManyRequired(
						emails.map(({ orgEmailId }) => {
							linkAuditLogs.push(AuditLogSchema.parse({ actorId, operation: 'LINK', orgEmailId }))
							return { orgEmailId }
						})
				  )
		) satisfies Prisma.OrgLocationEmailCreateNestedManyWithoutLocationInput | undefined
		const phoneLinks = (
			!phones
				? undefined
				: createManyRequired(
						phones.map(({ phoneId }) => {
							linkAuditLogs.push(AuditLogSchema.parse({ actorId, operation: 'LINK', phoneId }))
							return { phoneId }
						})
				  )
		) satisfies Prisma.OrgLocationPhoneCreateNestedManyWithoutLocationInput | undefined
		const auditEntry = AuditLogSchema.parse({
			actorId,
			operation: 'CREATE',
			to: dataTo,
		})

		return Prisma.validator<Prisma.OrgLocationCreateArgs>()({
			data: {
				...dataTo,
				...createGeoFields({ longitude: dataTo.longitude, latitude: dataTo.latitude }),
				emails: emailLinks,
				phones: phoneLinks,
				services: serviceLinks,
				auditLogs: {
					createMany: {
						data: [auditEntry, ...linkAuditLogs],
					},
				},
			},
		})
	})

	return { dataParser, inputSchema }
}
export type TCreateSchema = z.infer<ReturnType<typeof ZCreateSchema>['inputSchema']>
