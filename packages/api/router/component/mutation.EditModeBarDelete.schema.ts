import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZEditModeBarDeleteSchema = z.union([
	z.object({
		slug: z.string(),
		orgLocationId: z.never().optional(),
		orgServiceId: z.never().optional(),
		deleted: z.boolean(),
	}),
	z.object({
		orgLocationId: prefixedId('orgLocation'),
		slug: z.never().optional(),
		orgServiceId: z.never().optional(),
		deleted: z.boolean(),
	}),
	z.object({
		orgServiceId: prefixedId('orgService'),
		orgLocationId: z.never().optional(),
		slug: z.never().optional(),
		deleted: z.boolean(),
	}),
])
export type TEditModeBarDeleteSchema = z.infer<typeof ZEditModeBarDeleteSchema>
