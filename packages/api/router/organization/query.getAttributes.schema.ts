import { z } from 'zod'

import { attributeCategory } from '@weareinreach/db/generated/attributeCategory'
import { prefixedId } from '~api/schemas/idPrefix'

const categories = attributeCategory.map(({ tag }) => tag) as [string, ...string[]]
export const ZGetAttributesSchema = z
	.object({
		id: prefixedId('organization').optional(),
		slug: z.string().optional(),
		category: z.enum(categories).optional(),
		includeUnsupported: z.boolean().optional().default(false),
	})
	.refine(({ id, slug }) => {
		if (!id && !slug) {
			return false
		}
		return true
	}, 'Missing required params: `id` or `slug`')
export type TGetAttributesSchema = z.infer<typeof ZGetAttributesSchema>
