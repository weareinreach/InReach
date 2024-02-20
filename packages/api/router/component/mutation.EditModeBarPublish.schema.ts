import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZEditModeBarPublishSchema = z.union([
	z.object({
		slug: z.string(),
		orgLocationId: z.never().optional(),
		orgServiceId: z.never().optional(),
		published: z.boolean(),
	}),
	z.object({
		orgLocationId: prefixedId('orgLocation'),
		slug: z.never().optional(),
		orgServiceId: z.never().optional(),
		published: z.boolean(),
	}),
	z.object({
		orgServiceId: prefixedId('orgService'),
		orgLocationId: z.never().optional(),
		slug: z.never().optional(),
		published: z.boolean(),
	}),
])
export type TEditModeBarPublishSchema = z.infer<typeof ZEditModeBarPublishSchema>
