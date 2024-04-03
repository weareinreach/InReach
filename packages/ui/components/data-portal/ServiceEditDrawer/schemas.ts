import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'

const FreetextObject = z
	.object({
		text: z.string().nullable(),
		key: z.string().nullish(),
		ns: z.string().nullish(),
		crowdinId: z.number().nullish(),
	})
	.nullish()

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const JsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
)

export const FormSchema = z.object({
	name: FreetextObject,
	description: FreetextObject,
	services: prefixedId('serviceTag').array(),
	attributes: z
		.object({
			text: z
				.object({
					key: z.string(),
					text: z.string(),
					ns: z.string(),
				})
				.nullable(),
			boolean: z.boolean().nullable(),
			data: z.any(),
			active: z.boolean(),
			countryId: z.string().nullable(),
			govDistId: z.string().nullable(),
			languageId: z.string().nullable(),
			category: z.string(),
			attributeId: z.string(),
			supplementId: z.string(),
		})
		.array(),
	serviceAreas: z
		.object({
			id: prefixedId('serviceArea'),
			countries: prefixedId('country').array(),
			districts: prefixedId('govDist').array(),
		})
		.nullable(),
	published: z.boolean(),
	deleted: z.boolean(),
})
export type TFormSchema = z.infer<typeof FormSchema>
