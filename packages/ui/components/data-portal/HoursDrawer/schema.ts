import groupBy from 'just-group-by'
import { Interval } from 'luxon'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'

const HourRecord = z.object({
	id: prefixedId('orgHours'),
	closed: z.boolean(),
	open24hours: z.boolean(),
	tz: z.string(),
	dayIndex: z.number().min(0).max(6),
	interval: z.string().refine((val) => (Interval.fromISO(val).isValid ? true : 'Invalid interval')),
})
export const dayIndicies = [0, 1, 2, 3, 4, 5, 6] as DayIndex[]
export const isDayKey = (key: number): key is DayIndex => dayIndicies.includes(key as DayIndex)

export const FormSchema = z.object({
	data: HourRecord.array().superRefine((val, ctx) => {
		const idIdx = val.map(({ id }) => id)
		const grouped = groupBy(val, ({ dayIndex }) => dayIndex)
		for (const [_, times] of Object.entries(grouped)) {
			const intervals = times.map(({ id, interval }) => ({ id, interval: Interval.fromISO(interval) }))
			for (const interval of intervals) {
				const intervalsToCheck = intervals.filter((item) => item.id !== interval.id)
				intervalsToCheck.forEach((item) => {
					if (interval.interval.overlaps(item.interval)) {
						const path = idIdx.indexOf(interval.id)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: 'Opening times cannot overlap on the same day!',
							fatal: true,
							path: [path],
						})
					}
				})
			}
		}
	}),
})
export type ZFormSchema = z.infer<typeof FormSchema>
export type ZHourRecord = z.infer<typeof HourRecord>
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6
