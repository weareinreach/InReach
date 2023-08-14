import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForHoursDrawerSchema = z.union([
	prefixedId('organization'),
	prefixedId('orgService'),
	prefixedId('orgLocation'),
])
export type TForHoursDrawerSchema = z.infer<typeof ZForHoursDrawerSchema>
