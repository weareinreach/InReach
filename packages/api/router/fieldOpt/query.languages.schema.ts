import { z } from 'zod'

export const ZLanguagesSchema = z
	.object({ activelyTranslated: z.boolean(), localeCode: z.string() })
	.partial()
	.optional()
export type TLanguagesSchema = z.infer<typeof ZLanguagesSchema>
