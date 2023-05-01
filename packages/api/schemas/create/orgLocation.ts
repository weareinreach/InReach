import { geojsonToWKT } from '@terraformer/wkt'
import { z } from 'zod'
import { Prisma, GeoJSONPointSchema, generateId, createPoint, Geometry } from '@weareinreach/db'

import { idString, JsonInputOrNullSuperJSON, MutationBase, MutationBaseArray } from '~api/schemas/common'
import { createMany } from '~api/schemas/nestedOps'

import { AuditLogSchema } from './auditLog'

export const LinkOrgLocationServiceSchema = z.object({
	orgLocationId: idString,
	serviceId: idString,
})
export const LinkOrgLocationEmailSchema = z.object({
	orgLocationId: idString,
	orgEmailId: idString,
})
export const LinkOrgLocationPhoneSchema = z.object({
	orgLocationId: idString,
	phoneId: idString,
})

const createOrgBaseFields = {
	id: idString.optional(),
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
}

const generateGeoFields = ({ longitude, latitude }: { longitude: number; latitude: number }) => {
	const geoObj = createPoint({ longitude, latitude })
	return {
		geoWKT: geoObj !== 'JsonNull' ? geojsonToWKT(geoObj) : undefined,
		geoJSON: GeoJSONPointSchema.parse(geoObj),
	}
}

export const CreateOrgLocationBaseSchema = z.object(createOrgBaseFields).transform((data) => ({
	...data,
	...generateGeoFields({ longitude: data.longitude, latitude: data.latitude }),
}))
const OrgLocationLinksSchema = {
	emails: z.object({ orgEmailId: idString }).array().optional(),
	phones: z.object({ phoneId: idString }).array().optional(),
	services: z.object({ serviceId: idString }).array().optional(),
}

export const CreateNestedOrgLocationSchema = CreateOrgLocationBaseSchema.array().transform((data) =>
	Prisma.validator<Prisma.Enumerable<Prisma.OrgLocationCreateManyOrganizationInput>>()(data)
)

export const CreateManyOrgLocationSchema = () => {
	const { dataParser: parser, inputSchema } = MutationBaseArray(
		z.object({
			...createOrgBaseFields,
			orgId: z.string(),
		})
	)
	const dataParser = parser.transform(({ actorId, data, operation }) => {
		const dataOut: Prisma.OrgLocationCreateManyInput[] = []
		const auditLogs: Prisma.AuditLogCreateManyInput[] = []

		for (const record of data) {
			const id = generateId('orgLocation')
			dataOut.push(
				Prisma.validator<Prisma.OrgLocationCreateManyInput>()({
					id,
					...record.to,
					...generateGeoFields({ longitude: record.to.longitude, latitude: record.to.latitude }),
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
		z.object({ orgId: z.string(), ...createOrgBaseFields, ...OrgLocationLinksSchema })
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
				...generateGeoFields({ longitude: dataTo.longitude, latitude: dataTo.latitude }),
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

export const EditOrgLocationSchema = z
	.object({
		id: z.string(),
		data: z
			.object({
				legacyId: z.string(),
				name: z.string(),
				street1: z.string(),
				street2: z.string(),
				city: z.string(),
				postCode: z.string(),
				primary: z.boolean(),
				mailOnly: z.boolean(),
				longitude: z.number(),
				latitude: z.number(),
				geoJSON: Geometry,
				geoWKT: z.string(),
				published: z.boolean(),
				deleted: z.boolean(),
				checkMigration: z.boolean(),
			})
			.partial(),
	})
	.transform(({ id, data }) => Prisma.validator<Prisma.OrgLocationUpdateArgs>()({ where: { id }, data }))
