import { z } from 'zod'

import { FieldType } from '@weareinreach/db/zod_util/attributeSupplement'

export const ZAttributesByCategorySchema = z
	.object({
		categoryName: z.string().or(z.string().array()).optional().describe('categoryName'),
		canAttachTo: z.enum(['LOCATION', 'ORGANIZATION', 'SERVICE', 'USER']).array().optional(),
		attributeActive: z.boolean().default(true),
		categoryActive: z.boolean().default(true),
	})
	.optional()
export type TAttributesByCategorySchema = z.infer<typeof ZAttributesByCategorySchema>

const fieldTypeSchema = z.nativeEnum(FieldType)
const baseFieldAttributesSchema = z.object({
	key: z.string(),
	label: z.string(),
	name: z.string(),
	type: fieldTypeSchema,
	required: z.boolean().optional(),
})

const textFieldAttributesSchema = baseFieldAttributesSchema.extend({
	type: z.literal(FieldType.text),
})

const selectFieldAttributesSchema = baseFieldAttributesSchema.extend({
	type: z.literal(FieldType.select),
	options: z.array(
		z.object({
			value: z.string(),
			label: z.string(),
		})
	),
})

const numberFieldAttributesSchema = baseFieldAttributesSchema.extend({
	type: z.literal(FieldType.number),
})

const currencyFieldAttributesSchema = baseFieldAttributesSchema.extend({
	type: z.literal(FieldType.currency),
})

const fieldAttributesObject = z
	.union([
		textFieldAttributesSchema,
		selectFieldAttributesSchema,
		numberFieldAttributesSchema,
		currencyFieldAttributesSchema,
	])
	.brand('FieldAttributes')
	.array()
export const fieldAttributesSchema = fieldAttributesObject.or(fieldAttributesObject.array())

export type TFieldAttributesSchema = z.infer<typeof fieldAttributesSchema>
