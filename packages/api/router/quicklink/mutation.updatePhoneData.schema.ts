import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdatePhoneDataSchema = z
	.object({
		id: z.string(),
		to: z.object({
			serviceOnly: z.boolean().optional(),
			locationOnly: z.boolean().optional(),
			locations: z
				.object({ add: prefixedId('orgLocation').array(), del: prefixedId('orgLocation').array() })
				.partial(),
			services: z
				.object({ add: prefixedId('orgService').array(), del: prefixedId('orgService').array() })
				.partial(),
			published: z.boolean().optional(),
		}),
	})
	.array()
export type TUpdatePhoneDataSchema = z.infer<typeof ZUpdatePhoneDataSchema>
