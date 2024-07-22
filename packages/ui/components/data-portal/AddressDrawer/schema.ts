import { z } from 'zod'

import { boolOrNull, transformNullString } from '@weareinreach/api/schemas/common'
import * as PrismaEnums from '@weareinreach/db/enums'

export const AddressVisibilitySchema = z.nativeEnum(PrismaEnums.AddressVisibility)
export const FormSchema = z.object({
	id: z.string(),
	data: z
		.object({
			name: z.string().nullable(),
			street1: z.string().nullish().transform(transformNullString),
			street2: z.string().nullable().transform(transformNullString),
			city: z.string(),
			postCode: z.string().nullable().transform(transformNullString),
			primary: z.coerce.boolean(),
			mailOnly: z.boolean(),
			longitude: z.coerce.number().nullable(),
			latitude: z.coerce.number().nullable(),
			geoWKT: z.string().nullable().transform(transformNullString),
			published: z.coerce.boolean(),
			deleted: z.coerce.boolean(),
			countryId: z.string().nullable(),
			govDistId: z.string().nullable(),
			addressVisibility: z.nativeEnum(PrismaEnums.AddressVisibility),
			accessible: z
				.object({
					supplementId: z.string(),
					boolean: boolOrNull,
				})
				.partial(),
			services: z.string().array(),
		})
		.partial(),
})
export type FormSchema = z.infer<typeof FormSchema>
export const schemaTransform = ({ id, data }: FormSchema) => ({
	id,
	data: {
		...data,
		name: data.name === null ? undefined : data.name,
	},
})
