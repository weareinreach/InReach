import { Interval } from 'luxon'
import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

import { ZForHoursDrawerSchema } from './query.forHoursDrawer.schema'

const DataItem = z.object({
	id: prefixedId('orgHours'),
	dayIndex: z.number().min(0).max(6),
	closed: z.boolean(),
	open24hours: z.boolean(),
	tz: z.string(),
	interval: z.string().refine((val) => Interval.fromISO(val).isValid),
})

export const ZProcessDrawerSchema = z.object({
	// Which org/location/service this drawer's hours belong to - previously missing entirely, so every hour
	// created through this drawer was an orphan with no org/location/service link at all. Same id (org,
	// location, or service) the drawer's own forHoursDrawer query already accepts.
	entityId: ZForHoursDrawerSchema,
	createdVals: DataItem.array().nullable(),
	deletedVals: DataItem.array().nullable(),
	updatedVals: DataItem.array().nullable(),
})
export type TProcessDrawerSchema = z.infer<typeof ZProcessDrawerSchema>
