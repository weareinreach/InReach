import { z } from 'zod'

import { isIdFor } from '@weareinreach/db/lib/idGen'

export const ZGetTzSchema = z
	.string()
	.refine((val) => isIdFor('organization', val) || isIdFor('orgLocation', val) || isIdFor('orgService', val))

export type TGetTzSchema = z.infer<typeof ZGetTzSchema>
