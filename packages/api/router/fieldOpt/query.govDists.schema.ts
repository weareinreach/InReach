import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGovDistsSchema = z
	.object({
		id: prefixedId('govDist'),
		name: z.string(),
		slug: z.string(),
		iso: z.string(),
		abbrev: z.string(),
		countryId: prefixedId('country'),
		parentsOnly: z.boolean().default(true),
	})
	.partial()
	.optional()
	.transform((val) => {
		if (!val) return val
		const { parentsOnly, ...rest } = val
		return { ...rest, ...(parentsOnly ? { parentId: null } : {}) }
	})
export type TGovDistsSchema = z.infer<typeof ZGovDistsSchema>
