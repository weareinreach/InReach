import { z } from 'zod'

const numMinMax = z.object({
	/** Number range */
	type: z.literal('num-min-max'),
	/** Minumum of range */
	min: z.number(),
	/** Maximum of range */
	max: z.number(),
})

const number = z.object({
	/** Single number */
	type: z.literal('number'),
	num: z.number(),
})

const freeTextRecord = z.record(z.string().regex(/^[a-z]{2}$|^[a-z]{2}-[A-Z]{2}$/gm), z.string())
const freeTextTranslated = z
	.object({
		/** Free text - must be translated here - will not flow to CrowdIn */
		type: z.literal('free-text-translated'),
	})
	.catchall(freeTextRecord)

const incompatible = z
	.object({
		/** Incompatible data from migration - needs to be cleaned up. */
		type: z.literal('incompatible'),
	})
	.catchall(z.record(z.any()))

/**
 * Supplemental information for attribute
 *
 * @param type - `num-min-max`, `number`, `free-text-translated`, or `incompatible`
 */
export const AttributeSupplementDataSchema = z.discriminatedUnion('type', [
	numMinMax,
	number,
	freeTextTranslated,
	incompatible,
])
export type AttributeSupplementData = z.infer<typeof AttributeSupplementDataSchema>
