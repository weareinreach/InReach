import { z } from 'zod'

export const ZCountriesSchema = z
	.object({ activeForOrgs: z.boolean(), cca2: z.string() })
	.partial()
	.optional()
	.transform((val) => (val ? { where: val } : undefined))
export type TCountriesSchema = z.infer<typeof ZCountriesSchema>
