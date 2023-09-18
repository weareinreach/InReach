import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateServiceLocationDataSchema = z
	.object({
		id: z.string(),
		from: z
			.object({
				services: z.string().array(),
				published: z.boolean().optional(),
			})
			.partial(),
		to: z.object({
			services: z
				.object({ add: prefixedId('orgService').array(), del: prefixedId('orgService').array() })
				.partial(),
			published: z.boolean().optional(),
		}),
	})
	.array()
export type TUpdateServiceLocationDataSchema = z.infer<typeof ZUpdateServiceLocationDataSchema>
