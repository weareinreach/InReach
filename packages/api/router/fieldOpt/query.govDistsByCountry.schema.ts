import { z } from 'zod'

export const ZGovDistsByCountrySchema = z
	.object({
		cca2: z.string().optional().describe('Country CCA2 code'),
		activeForOrgs: z.boolean().nullish().default(true),
		activeForSuggest: z.boolean().nullish(),
	})
	.optional()
export type TGovDistsByCountrySchema = z.infer<typeof ZGovDistsByCountrySchema>
