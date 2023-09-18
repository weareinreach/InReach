import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetAlertsSchema = z
	.object({
		id: prefixedId('organization').optional(),
		slug: z.string().optional(),
	})
	.refine(({ id, slug }) => {
		if (!id && !slug) {
			return false
		}
		return true
	}, 'Missing required params: `id` or `slug`')
export type TGetAlertsSchema = z.infer<typeof ZGetAlertsSchema>
