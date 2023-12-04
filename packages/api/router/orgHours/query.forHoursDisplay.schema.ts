import { z } from 'zod'

import { isIdFor } from '@weareinreach/db'

export const ZForHoursDisplaySchema = z.string()
// .refine((val) => isIdFor('organization', val) || isIdFor('orgLocation', val) || isIdFor('orgService', val))

// z.union([
// 	prefixedId('organization'),
// 	prefixedId('orgService'),
// 	prefixedId('orgLocation'),
// ])
export type TForHoursDisplaySchema = z.infer<typeof ZForHoursDisplaySchema>
