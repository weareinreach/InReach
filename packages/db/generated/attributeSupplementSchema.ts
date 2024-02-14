import { z } from 'zod'

export const attributeSupplementSchema = {
	accessInstructions: z.object({
		access_type: z.enum(['email', 'file', 'link', 'location', 'other', 'phone']),
		access_value: z.union([z.string(), z.null()]).optional(),
		instructions: z.string(),
	}),
	incompatibleData: z.array(z.record(z.any())),
	number: z.object({ num: z.number() }),
	numMax: z.object({ max: z.number() }),
	numMin: z.object({ min: z.number() }),
	numMinMaxOrRange: z.union([
		z.object({ min: z.number() }),
		z.object({ max: z.number() }),
		z.object({ max: z.number(), min: z.number() }),
	]),
	numRange: z.object({ max: z.number(), min: z.number() }),
	otherDescribe: z.object({ other: z.string() }),
}

export const isAttributeSupplementSchema = (schema: string): schema is AttributeSupplementSchemas =>
	Object.keys(attributeSupplementSchema).includes(schema)

export type AttributeSupplementSchemas = keyof typeof attributeSupplementSchema
