import { z } from 'zod'

export const attributeSupplementSchema = {
	'access-instruction-email': z
		.object({
			access_type: z.literal('email').default('email'),
			access_value: z.union([z.string().email(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	'access-instruction-file': z
		.object({
			access_type: z.literal('file').default('file'),
			access_value: z.union([z.string().url(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	'access-instruction-link': z
		.object({
			access_type: z.literal('link').default('link'),
			access_value: z.union([z.string().url(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	'access-instruction-location': z
		.object({
			access_type: z.literal('location').default('location'),
			access_value: z.union([z.string(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	'access-instruction-other': z
		.object({
			access_type: z.literal('other').default('other'),
			access_value: z.union([z.string(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	'access-instruction-phone': z
		.object({
			access_type: z.literal('phone').default('phone'),
			access_value: z.union([z.string(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	'access-instruction-publicTransport': z
		.object({
			access_type: z.literal('publicTransit').default('publicTransit'),
			access_value: z.union([z.string(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	accessInstructions: z.object({
		access_type: z.enum(['email', 'file', 'link', 'location', 'other', 'phone']),
		access_value: z.union([z.string(), z.null()]).optional(),
		instructions: z.string(),
	}),
	'access-instruction-sms': z
		.object({
			sms_body: z.string().optional(),
			access_type: z.literal('sms').default('sms'),
			access_value: z.union([z.string(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	'access-instruction-whatsapp': z
		.object({
			access_type: z.literal('whatsapp').default('whatsapp'),
			access_value: z.union([z.string(), z.null()]).optional(),
			instructions: z.string().optional(),
		})
		.strict(),
	currency: z.object({ cost: z.number(), currency: z.union([z.string(), z.null()]).optional() }).strict(),
	incompatibleData: z.array(z.record(z.any())),
	number: z.object({ num: z.number() }),
	numMax: z.object({ max: z.number() }),
	numMin: z.object({ min: z.number() }),
	numMinMaxOrRange: z.union([
		z.object({ max: z.never().optional(), min: z.number() }).strict(),
		z.object({ max: z.number(), min: z.never().optional() }).strict(),
		z.object({ max: z.number(), min: z.number() }).strict(),
	]),
	numRange: z.object({ max: z.number(), min: z.number() }),
	otherDescribe: z.object({ other: z.string() }),
}

export const isAttributeSupplementSchema = (schema: string): schema is AttributeSupplementSchemas =>
	Object.keys(attributeSupplementSchema).includes(schema)

export type AttributeSupplementSchemas = keyof typeof attributeSupplementSchema
