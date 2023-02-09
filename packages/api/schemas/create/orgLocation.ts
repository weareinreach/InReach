import { Prisma, GeoJSONPointSchema, createId } from '@weareinreach/db'
import { z } from 'zod'

import { cuid, JsonInputOrNullSuperJSON, MutationBase, MutationBaseArray } from '~api/schemas/common'
import { createMany } from '~api/schemas/nestedOps'

import { AuditLogSchema } from './auditLog'

export const LinkOrgLocationServiceSchema = z.object({
	orgLocationId: cuid,
	serviceId: cuid,
})
export const LinkOrgLocationEmailSchema = z.object({
	orgLocationId: cuid,
	orgEmailId: cuid,
})
export const LinkOrgLocationPhoneSchema = z.object({
	orgLocationId: cuid,
	phoneId: cuid,
})

export const CreateOrgLocationBaseSchema = z.object({
	id: cuid.optional(),
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
	geoJSON: GeoJSONPointSchema,
	published: z.boolean().default(false),
})
const OrgLocationLinksSchema = z.object({
	emails: LinkOrgLocationEmailSchema.omit({ orgLocationId: true }).array().optional(),
	phones: LinkOrgLocationPhoneSchema.omit({ orgLocationId: true }).array().optional(),
	services: LinkOrgLocationServiceSchema.omit({ orgLocationId: true }).array().optional(),
})

export const CreateNestedOrgLocationSchema = CreateOrgLocationBaseSchema.array().transform((data) =>
	Prisma.validator<Prisma.Enumerable<Prisma.OrgLocationCreateManyOrganizationInput>>()(data)
)

export const CreateManyOrgLocationSchema = () => {
	const { dataParser: parser, inputSchema } = MutationBaseArray(
		CreateOrgLocationBaseSchema.extend({ orgId: z.string() })
	)
	const dataParser = parser.transform(({ actorId, data, operation }) => {
		const dataOut: Prisma.OrgLocationCreateManyInput[] = []
		const auditLogs: Prisma.AuditLogCreateManyInput[] = []

		for (const record of data) {
			const id = createId()
			dataOut.push(
				Prisma.validator<Prisma.OrgLocationCreateManyInput>()({
					id,
					...record.to,
				})
			)
			auditLogs.push(
				Prisma.validator<Prisma.AuditLogCreateManyInput>()({
					actorId,
					operation,
					from: JsonInputOrNullSuperJSON.parse(record.from),
					to: JsonInputOrNullSuperJSON.parse(record.to),
					orgLocationId: id,
				})
			)
		}
		return { data: dataOut, auditLogs }
	})

	return { dataParser, inputSchema }
}

export const CreateOrgLocationSchema = () => {
	const { dataParser: parser, inputSchema } = MutationBase(
		CreateOrgLocationBaseSchema.extend({ orgId: z.string() }).merge(OrgLocationLinksSchema)
	)
	const dataParser = parser.transform(({ actorId, operation, from, to }) => {
		const { emails, phones, services, ...dataTo } = to
		const linkAuditLogs: Prisma.AuditLogUncheckedCreateWithoutOrgLocationInput[] = []
		const serviceLinks = (
			!services
				? undefined
				: createMany(
						services.map(({ serviceId }) => {
							linkAuditLogs.push(AuditLogSchema.parse({ actorId, operation: 'LINK', serviceId }))
							return { serviceId }
						})
				  )
		) satisfies Prisma.OrgLocationServiceCreateNestedManyWithoutLocationInput | undefined

		const emailLinks = (
			!emails
				? undefined
				: createMany(
						emails.map(({ orgEmailId }) => {
							linkAuditLogs.push(AuditLogSchema.parse({ actorId, operation: 'LINK', orgEmailId }))
							return { orgEmailId }
						})
				  )
		) satisfies Prisma.OrgLocationEmailCreateNestedManyWithoutLocationInput | undefined
		const phoneLinks = (
			!phones
				? undefined
				: createMany(
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
