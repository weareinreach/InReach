import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z.object({
	rating: z.number(),
	reviewText: z.string().optional(),
	visible: z.boolean().optional(),
	// toxicity/langConfidence are deliberately NOT accepted here - they're meant to be computed server-side
	// by a moderation service (see the `toxicity` column's doc comment, "From https://perspectiveapi.com/"),
	// never supplied by whoever is submitting the review.
	lcrCity: z.string().optional(),
	organizationId: prefixedId('organization'),
	orgServiceId: prefixedId('orgService').optional(),
	orgLocationId: prefixedId('orgLocation').optional(),
	languageId: prefixedId('language').optional(),
	lcrGovDistId: prefixedId('govDist').optional(),
	lcrCountryId: prefixedId('country').optional(),
})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
