import { z } from 'zod'

const numMinMax = z.object({
	/** Number range */
	type: z.literal('num-min-max'),
	/** Minumum of range */
	min: z.number(),
	/** Maximum of range */
	max: z.number(),
})

const numMin = z.object({
	type: z.literal('num-min'),
	min: z.number(),
})
const numMax = z.object({
	type: z.literal('num-max'),
	max: z.number(),
})

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

/**
 * Supplemental information for attribute
 *
 * @param type - `num-min-max`, `num-min`, `num-max`, `number`, or `incompatible`
 */
export const AttributeSupplementDataSchemas = z.discriminatedUnion('type', [
	numMinMax,
	numMin,
	numMax,
	number,
	incompatible,
])
export type AttributeSupplementData = z.infer<typeof AttributeSupplementDataSchemas>
