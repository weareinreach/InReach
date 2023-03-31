import { z } from 'zod'

const numMinMax = z.object({
	/** Number range */
	type: z.literal('numMinMax'),
	/** Minumum of range */
	min: z.number(),
	/** Maximum of range */
	max: z.number(),
})

const numMin = z.object({
	type: z.literal('numMin'),
	min: z.number(),
})
const numMax = z.object({
	type: z.literal('numMax'),
	max: z.number(),
})
const numMinMaxOpt = z.object({
	type: z.literal('numMinMaxOpt'),
	min: z.number().optional(),
	max: z.number().optional(),
}) //.refine(({min,max}) => Boolean(min || max),{message: 'Requires at least `min` or `max`.'})

const number = z.object({
	/** Single number */
	type: z.literal('number'),
	num: z.number(),
})

const incompatible = z
	.object({
		/** Incompatible data from migration - needs to be cleaned up. */
		type: z.literal('incompatible'),
	})
	.catchall(z.record(z.any()))
const accessInstructions = z.object({
	type: z.literal('accessInstructions'),
	access_value: z.string().nullish(),
	access_type: z.enum(['email', 'file', 'link', 'location', 'other', 'phone', '']),
	instructions: z.string(),
})

/**
 * Supplemental information for attribute
 *
 * @param type - `num-min-max`, `num-min`, `num-max`, `number`, or `incompatible`
 */
export const AttributeSupplementDataSchemas = z.discriminatedUnion('type', [
	numMinMaxOpt,
	numMinMax,
	numMin,
	numMax,
	number,
	incompatible,
	accessInstructions,
])
export type AttributeSupplementData = z.infer<typeof AttributeSupplementDataSchemas>

export const AttSuppSchemas = {
	numMinMax: numMinMax,
	numMin: numMin,
	numMax: numMax,
	numMinMaxOpt: numMinMaxOpt.refine(({ min, max }) => Boolean(min || max), {
		message: 'Requires at least `min` or `max`.',
	}),
	number: number,
	incompatible: incompatible,
	accessInstructions: accessInstructions,
}

export type AttributeSupplementSchemas = keyof typeof AttSuppSchemas
