import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateEmailDataSchema = z
	.object({
		id: z.string(),
		from: z
			.object({
				serviceOnly: z.boolean().optional(),
				locationOnly: z.boolean().optional(),
				published: z.boolean().optional(),
				locations: z.string().array(),
				services: z.string().array(),
			})
			.partial(),
		to: z.object({
			serviceOnly: z.boolean().optional(),
			locationOnly: z.boolean().optional(),
			published: z.boolean().optional(),
			locations: z
				.object({ add: prefixedId('orgLocation').array(), del: prefixedId('orgLocation').array() })
				.partial(),
			services: z
				.object({ add: prefixedId('orgService').array(), del: prefixedId('orgService').array() })
				.partial(),
		}),
	})
	.array()
export type TUpdateEmailDataSchema = z.infer<typeof ZUpdateEmailDataSchema>
