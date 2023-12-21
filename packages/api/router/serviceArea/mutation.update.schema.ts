import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z.object({
	id: prefixedId('serviceArea'),
	districts: z.object({
		createdVals: prefixedId('govDist').array().nullable(),
		deletedVals: prefixedId('govDist').array().nullable(),
	}),
	countries: z.object({
		createdVals: prefixedId('country').array().nullable(),
		deletedVals: prefixedId('country').array().nullable(),
	}),
})
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
