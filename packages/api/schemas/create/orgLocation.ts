import { Prisma, GeoJSONPointSchema } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgLocationSchema = z.object({
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

export const CreateNestedOrgLocationSchema = CreateOrgLocationSchema.array()

export const CreateNestedOrgLocationPrisma = (data?: z.infer<typeof CreateNestedOrgLocationSchema>) => {
	if (!data) return undefined
	return Prisma.validator<Prisma.OrgLocationCreateNestedManyWithoutOrganizationInput>()({
		createMany: {
			data: data.map(
				({
					name,
					street1,
					street2,
					city,
					postCode,
					primary,
					govDistId,
					countryId,
					longitude,
					latitude,
					geoJSON,
					published,
				}) => ({
					name,
					street1,
					street2,
					city,
					postCode,
					primary,
					govDistId,
					countryId,
					longitude,
					latitude,
					geoJSON,
					published,
				})
			),
		},
	})
}
