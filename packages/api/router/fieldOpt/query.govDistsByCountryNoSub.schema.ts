import { z } from 'zod'

export const ZGovDistsByCountryNoSubSchema = z
	.object({
		cca2: z.string().optional().describe('Country CCA2 code'),
		activeForOrgs: z.boolean().nullish().default(true),
		activeForSuggest: z.boolean().nullish(),
	})
	.optional()
export type TGovDistsByCountryNoSubSchema = z.infer<typeof ZGovDistsByCountryNoSubSchema>
