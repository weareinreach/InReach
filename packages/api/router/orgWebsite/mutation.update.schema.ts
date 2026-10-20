import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'
import { webUrlString } from '~api/schemas/webUrl'

export const ZUpdateSchema = z.object({
	id: prefixedId('orgWebsite'),
	data: z
		.object({
			url: webUrlString(),
			isPrimary: z.boolean(),
			published: z.boolean(),
			deleted: z.boolean(),
			organizationId: prefixedId('organization').nullish().catch(undefined),
			orgLocationId: prefixedId('orgLocation').optional().catch(undefined),
			orgLocationOnly: z.boolean(),
		})
		.partial(),
})

export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
