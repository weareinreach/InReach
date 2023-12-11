import { z } from 'zod'

import { isIdFor } from '@weareinreach/db'

export const ZForHoursDisplaySchema = z
	.string()
	.refine((val) => isIdFor('organization', val) || isIdFor('orgLocation', val) || isIdFor('orgService', val))

export type TForHoursDisplaySchema = z.infer<typeof ZForHoursDisplaySchema>
