import { z } from 'zod'

export const ZAutocompleteSchema = z.object({
	search: z.string(),
	locale: z.string().optional(),
	cityOnly: z.boolean().default(false).optional(),
	fullAddress: z.boolean().default(false).optional(),
})
export type TAutocompleteSchema = z.infer<typeof ZAutocompleteSchema>
