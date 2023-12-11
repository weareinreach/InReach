import { Interval } from 'luxon'
import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

const DataItem = z.object({
	id: prefixedId('orgHours'),
	dayIndex: z.number().min(0).max(6),
	closed: z.boolean(),
	open24hours: z.boolean(),
	tz: z.string(),
	interval: z.string().refine((val) => Interval.fromISO(val).isValid),
})

export const ZProcessDrawerSchema = z.object({
	createdVals: DataItem.array().nullable(),
	deletedVals: DataItem.array().nullable(),
	updatedVals: DataItem.array().nullable(),
})
export type TProcessDrawerSchema = z.infer<typeof ZProcessDrawerSchema>
