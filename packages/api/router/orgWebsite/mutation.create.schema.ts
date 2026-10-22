import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'
import { webUrlString } from '~api/schemas/webUrl'

export const ZCreateSchema = z.object({
	orgId: prefixedId('organization'),
	data: z.object({
		url: webUrlString(),
		isPrimary: z.boolean().optional(),
		published: z.boolean().optional(),
		organizationId: prefixedId('organization').optional(),
		orgLocationId: prefixedId('orgLocation').optional(),
		orgLocationOnly: z.boolean(),
		description: z.string().optional(),
	}),
})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
