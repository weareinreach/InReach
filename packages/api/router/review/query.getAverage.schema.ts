import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetAverageSchema = z.union([
	prefixedId('organization'),
	prefixedId('orgService'),
	prefixedId('orgLocation'),
])
export type TGetAverageSchema = z.infer<typeof ZGetAverageSchema>
