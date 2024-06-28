import { z } from 'zod'

import { Geometry, Prisma, PrismaEnums } from '@weareinreach/db'
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
				mailOnly: z.boolean(),
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
				addressVisibility: z.nativeEnum(PrismaEnums.AddressVisibility),
			})
			.partial(),
	})
	.transform(({ id, data }) => {
		const { accessible, countryId, govDistId, services, ...rest } = data

		const accessibleAttrId = allAttributes.find(({ tag }) => tag === 'wheelchair-accessible')?.id

		const updateAccessibility = accessible?.boolean !== undefined && accessibleAttrId

		const attributes =
			accessible?.boolean !== null
				? {
						attributes: {
							upsert: {
								where: { id: accessible?.supplementId ?? '' },
								create: {
									attribute: { connect: { id: accessibleAttrId } },
									boolean: accessible?.boolean,
								},
								update: {
									boolean: accessible?.boolean,
								},
							},
						},
					}
				: {
						attributes: {
							delete: { id: accessible.supplementId ?? '' },
						},
					}

		return Prisma.validator<Prisma.OrgLocationUpdateArgs>()({
			where: { id },
			data: {
				...rest,
				...(updateAccessibility ? attributes : {}),
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
