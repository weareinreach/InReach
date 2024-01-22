import { z } from 'zod'

export const ZGetCountryTranslationSchema = z.object({
	cca2: z
		.string()
		.length(2)
		.transform((str) => str.toUpperCase()),
})
export type TGetCountryTranslationSchema = z.infer<typeof ZGetCountryTranslationSchema>
