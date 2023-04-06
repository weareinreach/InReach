import { z } from 'zod'

const nonEmptyString = z.string().trim().min(2)
const nonEmptyStringOpt = z
	.string()
	.trim()
	.transform((data) => (data === '' ? undefined : data))
	.optional()

export const SuggestionSchema = z.object({
	countryId: nonEmptyString,
	orgName: nonEmptyString,
	orgSlug: nonEmptyString,
	orgWebsite: nonEmptyStringOpt,
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
