import { z } from 'zod'

const nonEmptyString = z.string().trim().min(2)

export const SuggestionSchema = z.object({
	countryId: nonEmptyString,
	orgName: nonEmptyString,
	orgSlug: nonEmptyString,
	orgWebsite: z.union([z.literal(''), z.string().trim().url('Invalid URL format')]).optional(),
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
