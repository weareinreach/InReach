import { z } from 'zod'

const numMinMax = z.object({
	/** Minumum of range */
	min: z.number(),
	/** Maximum of range */
	max: z.number(),
})

const numMin = z.object({
	min: z.number(),
})
const numMax = z.object({
	max: z.number(),
})

const number = z.object({
	/** Single number */
	num: z.number(),
})

const incompatible = z
	.object({
		/** Incompatible data from migration - needs to be cleaned up. */
	})
	.catchall(z.record(z.any()))
const accessInstructions = z.object({
	access_value: z.string().nullish(),
	access_type: z.enum(['email', 'file', 'link', 'location', 'other', 'phone', '', 'publicTransit']),
	instructions: z.string(),
})
const cost = z.object({
	cost: z.number(),
	currency: z.string().nullish(),
})
const age = z
	.object({
		min: z.number().nullish(),
		max: z.number().nullish(),
	})
	.refine((data) => Object.keys(data).length > 0)

export const supplementSchema = {
	numMax,
	numMin,
	numMinMax,
	number,
	incompatible,
	accessInstructions,
	cost,
	age,
}
export type SupplementSchemas = {
	[K in keyof typeof supplementSchema]: z.infer<(typeof supplementSchema)[K]>
}
