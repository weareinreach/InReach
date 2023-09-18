import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetParentNameSchema = z
	.object({ slug: z.string(), orgLocationId: z.undefined() })
	.or(z.object({ orgLocationId: prefixedId('orgLocation'), slug: z.undefined() }))
export type TGetParentNameSchema = z.infer<typeof ZGetParentNameSchema>
