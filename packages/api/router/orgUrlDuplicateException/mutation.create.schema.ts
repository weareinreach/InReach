import { z } from 'zod'

import { normalizeFullUrl } from '@weareinreach/util/url'

export const ZCreateSchema = z.object({
	baseUrl: z
		.string()
		.min(1, 'A base URL is required.')
		.transform((url) => normalizeFullUrl(url)),
	description: z.string().min(1, 'A description is required.'),
})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
