import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z.object({
	rating: z.number(),
	reviewText: z.string().optional(),
	visible: z.boolean().optional(),
	toxicity: z.number().optional(),
	lcrCity: z.string().optional(),
	langConfidence: z.number().optional(),
	organizationId: prefixedId('organization'),
	orgServiceId: prefixedId('orgService').optional(),
	orgLocationId: prefixedId('orgLocation').optional(),
	languageId: prefixedId('language').optional(),
	lcrGovDistId: prefixedId('govDist').optional(),
	lcrCountryId: prefixedId('country').optional(),
})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
