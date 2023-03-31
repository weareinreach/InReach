import { z } from 'zod'

export const SuggestionSchema = z.object({
	countryId: z.string(),
	orgName: z.string(),
	orgSlug: z.string(),
	orgWebsite: z.string().nullish(),
	orgAddress: z
		.object({
			street1: z.string(),
			city: z.string(),
			govDist: z.string(),
			postCode: z.string(),
		})
		.partial()
		.nullish(),
	serviceCategories: z.string().array().nullish(),
	communityFocus: z.string().array().nullish(),
})
