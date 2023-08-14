import { z } from 'zod'

import { createGeoFields, generateId, generateNestedFreeText, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'
import { createManyWithAudit } from '~api/schemas/nestedOps'

export const ZCreateNewQuickSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
			id: prefixedId('organization').default(generateId('organization')),
			name: z.string(),
			slug: z.string(),
			sourceId: prefixedId('source'),
			description: z.string().optional(),
			locations: z
				.object({
					id: prefixedId('orgLocation').optional().default(generateId('orgLocation')),
					name: z.string().optional(),
					street1: z.string(),
					street2: z.string().optional(),
					city: z.string(),
					postCode: z.string().optional(),
					primary: z.boolean().optional(),
					govDistId: z.string(),
					countryId: z.string(),
					longitude: z.number().gte(-180).lte(180),
					latitude: z.number().gte(-90).lte(90),
					published: z.boolean().default(false),
				})
				.array()
				.optional(),
			emails: z
				.object({
					id: prefixedId('orgEmail').optional().default(generateId('orgEmail')),
					firstName: z.string().optional(),
					lastName: z.string().optional(),
					primary: z.boolean().default(false),
					email: z.string().email(),
					published: z.boolean().default(false),
				})
				.array()
				.optional(),
			phones: z
				.object({
					id: prefixedId('orgPhone').optional().default(generateId('orgPhone')),
					number: z.string(),
					ext: z.string().nullish(),
					primary: z.boolean().default(false),
					published: z.boolean().default(false),
					countryId: z.string(),
					phoneTypeId: z.string().optional(),
					locationOnly: z.boolean().default(false),
				})
				.array()
				.optional(),
			websites: z
				.object({
					id: prefixedId('orgWebsite').optional().default(generateId('orgWebsite')),
					url: z.string().url(),
				})
				.array()
				.optional(),
			socialMedia: z
				.object({
					id: prefixedId('orgSocialMedia').optional().default(generateId('orgSocialMedia')),
					username: z.string(),
					url: z.string().url(),
					published: z.boolean().default(false),
					serviceId: z.string(),
				})
				.array()
				.optional(),
		})
	)

	const dataParser = parser.transform(({ actorId, operation, data }) => {
		const { name, slug, sourceId } = data

		const locations = data.locations?.length
			? data.locations.map(({ latitude, longitude, ...record }) => ({
					...record,
					...createGeoFields({ latitude, longitude }),
			  }))
			: undefined
		return Prisma.validator<Prisma.OrganizationCreateArgs>()({
			data: {
				name,
				slug,
				source: {
					connect: { id: sourceId },
				},
				description: data.description
					? generateNestedFreeText({ orgId: data.id, type: 'orgDesc', text: data.description })
					: undefined,
				locations: createManyWithAudit(locations, actorId),
				emails: createManyWithAudit(data.emails, actorId),
				phones: createManyWithAudit(data.phones, actorId),
				socialMedia: createManyWithAudit(data.socialMedia, actorId),
				websites: createManyWithAudit(data.websites, actorId),
				auditLogs: CreateAuditLog({ actorId, operation, to: { name, slug, sourceId } }),
			},
			include: {
				description: Boolean(data.description),
				locations: Boolean(data.locations),
				emails: Boolean(data.emails),
				phones: Boolean(data.phones),
				websites: Boolean(data.websites),
				socialMedia: Boolean(data.socialMedia),
			},
		})
	})
	return { dataParser, inputSchema }
}
export type TCreateNewQuickSchema = z.infer<ReturnType<typeof ZCreateNewQuickSchema>['inputSchema']>
