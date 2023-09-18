import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForHoursDisplaySchema = z.union([
	prefixedId('organization'),
	prefixedId('orgService'),
	prefixedId('orgLocation'),
])
export type TForHoursDisplaySchema = z.infer<typeof ZForHoursDisplaySchema>
