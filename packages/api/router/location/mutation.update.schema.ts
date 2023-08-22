import { z } from 'zod'

import { Geometry, Prisma } from '@weareinreach/db'
import { allAttributes } from '@weareinreach/db/generated/allAttributes'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgLocation'),
		data: z
			.object({
				name: z.string(),
				street1: z.string().nullish(),
				street2: z.string().nullish(),
				city: z.string(),
				postCode: z.string().nullable(),
				primary: z.boolean(),
				mailOnly: z.boolean().nullable(),
				longitude: z.number().nullable(),
				latitude: z.number().nullable(),
				geoJSON: Geometry,
				geoWKT: z.string().nullable(),
				published: z.boolean(),
				deleted: z.boolean(),
				checkMigration: z.boolean(),
				accessible: z.object({
					supplementId: prefixedId('attributeSupplement').optional(),
					boolean: z.boolean().nullish(),
				}),
				countryId: prefixedId('country').nullable(),
				govDistId: prefixedId('govDist').nullable(),
				services: z.string().array(),
			})
			.partial(),
	})
	.transform(({ id, data }) => {
		const { accessible, countryId, govDistId, services, mailOnly, ...rest } = data

		const accessibleAttrId = allAttributes.find(({ tag }) => tag === 'wheelchair-accessible')?.id

		const updateAccessibility = accessible?.boolean !== undefined && accessibleAttrId

		return Prisma.validator<Prisma.OrgLocationUpdateArgs>()({
			where: { id },
			data: {
				...rest,
				mailOnly: mailOnly === false ? null : mailOnly,
				...(updateAccessibility
					? accessible.boolean !== null
						? {
								attributes: {
									upsert: {
										where: { locationId_attributeId: { locationId: id, attributeId: accessibleAttrId } },
										create: {
											attribute: { connect: { id: accessibleAttrId } },
											supplement: { create: { boolean: accessible.boolean } },
										},
										update: {
											supplement: {
												upsert: {
													where: { id: accessible.supplementId ?? '' },
													create: { boolean: accessible.boolean },
													update: { boolean: accessible.boolean },
												},
											},
										},
									},
								},
						  }
						: {
								attributes: {
									delete: { locationId_attributeId: { locationId: id, attributeId: accessibleAttrId } },
								},
						  }
					: {}),
				...(countryId
					? {
							country: { connect: { id: countryId } },
					  }
					: {}),
				...(govDistId
					? {
							govDist: { connect: { id: govDistId } },
					  }
					: {}),
				...(services
					? {
							services: {
								createMany: { data: services.map((serviceId) => ({ serviceId })), skipDuplicates: true },
								deleteMany: { NOT: { serviceId: { in: services } } },
							},
					  }
					: {}),
			},
		})
	})
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
