import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateNewSuggestionSchema = z.object({
	countryId: prefixedId('country'),
	orgName: z.string().trim().min(2),
	orgSlug: z.string().regex(/^[A-Za-z0-9-]*$/, 'Slug must only contain letters, numbers, and hyphens'),
	orgWebsite: z.string().trim().url().optional(),
	orgAddress: z
		.object({
			street1: z.string(),
			city: z.string(),
			govDist: z.string(),
			postCode: z.string(),
		})
		.partial()
		.nullish(),
	serviceCategories: prefixedId('serviceCategory').array().nullish(),
	communityFocus: prefixedId('attribute').array().nullish(),
})
export type TCreateNewSuggestionSchema = z.infer<typeof ZCreateNewSuggestionSchema>
