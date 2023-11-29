import { z } from 'zod'

export const ZCountriesSchema = z
	.object({
		where: z.object({ activeForOrgs: z.boolean(), cca2: z.string() }).partial(),
		// includeGeo: z.object({ wkt: z.boolean(), json: z.boolean() }),
	})
	.partial()
	.optional()
export type TCountriesSchema = z.infer<typeof ZCountriesSchema>
