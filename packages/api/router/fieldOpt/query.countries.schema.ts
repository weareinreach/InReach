import { z } from 'zod'

export const ZCountriesSchema = z
	.object({
		where: z.object({ activeForOrgs: z.boolean(), cca2: z.string() }),
		// includeGeo: z.object({ wkt: z.boolean(), json: z.boolean() }),
	})
	.deepPartial()
	.optional()
export type TCountriesSchema = z.infer<typeof ZCountriesSchema>
