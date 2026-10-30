import { z } from 'zod'

import { normalizeFullUrl } from '@weareinreach/util/url'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z.object({
	id: prefixedId('orgUrlDuplicateException'),
	baseUrl: z
		.string()
		.min(1, 'A base URL is required.')
		.transform((url) => normalizeFullUrl(url))
		.optional(),
	description: z.string().min(1, 'A description is required.').optional(),
})
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
