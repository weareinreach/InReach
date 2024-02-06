import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZEditModeBarSchema = z.union([
	z.object({
		slug: z.string(),
		orgLocationId: z.never().optional(),
		orgServiceId: z.never().optional(),
	}),
	z.object({
		orgLocationId: prefixedId('orgLocation'),
		slug: z.never().optional(),
		orgServiceId: z.never().optional(),
	}),
	z.object({
		orgServiceId: prefixedId('orgService'),
		orgLocationId: z.never().optional(),
		slug: z.never().optional(),
	}),
])
export type TEditModeBarSchema = z.infer<typeof ZEditModeBarSchema>
