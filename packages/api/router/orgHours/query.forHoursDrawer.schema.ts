import { z } from 'zod'

import { isIdFor } from '@weareinreach/db/lib/idGen'

export const ZForHoursDrawerSchema = z
	.string()
	.refine((val) => isIdFor('organization', val) || isIdFor('orgLocation', val) || isIdFor('orgService', val))
export type TForHoursDrawerSchema = z.infer<typeof ZForHoursDrawerSchema>
