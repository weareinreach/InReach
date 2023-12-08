import { Interval } from 'luxon'
import { type LiteralUnion, PartialDeep, type RequiredDeep } from 'type-fest'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'

// export const FormSchema = z.object({
// 	original: z.record(
// 		z.enum(['0', '1', '2', '3', '4', '5', '6']),
// 		z
// 			.object({
// 				id: prefixedId('orgHours'),
// 				closed: z.boolean(),
// 				open24hours: z.boolean(),
// 				tz: z.string(),
// 				dayIndex: z.number().min(0).max(6),
// 				interval: z.custom<Interval<true>>((val) => Interval.isInterval(val)),
// 			})
// 			.array()
// 	),
// 	create: z
// 		.object({
// 			id: prefixedId('orgHours'),
// 			closed: z.boolean().default(false),
// 			open24hours: z.boolean().default(false),
// 			tz: z.string(),
// 			dayIndex: z.number().min(0).max(6),
// 			interval: z.custom<Interval<true>>((val) => Interval.isInterval(val)),
// 			organizationId: prefixedId('organization').optional(),
// 			orgLocId: prefixedId('orgLocation').optional(),
// 			orgServiceId: prefixedId('orgService').optional(),
// 			active: z.boolean().default(true),
// 		})
// 		.array()
// 		.optional(),
// 	update: z
// 		.object({
// 			id: prefixedId('orgHours'),
// 			closed: z.boolean().optional(),
// 			open24hours: z.boolean().optional(),
// 			tz: z.string().optional(),
// 			dayIndex: z.number().min(0).max(6).optional(),
// 			interval: z.custom<Interval<true>>((val) => Interval.isInterval(val)).optional(),
// 			organizationId: prefixedId('organization').optional(),
// 			orgLocId: prefixedId('orgLocation').optional(),
// 			orgServiceId: prefixedId('orgService').optional(),
// 			active: z.boolean().optional(),
// 		})
// 		.array()
// 		.optional(),
// 	delete: prefixedId('orgHours').array().optional(),
// })

const HourRecord = z.object({
	id: prefixedId('orgHours'),
	closed: z.boolean(),
	open24hours: z.boolean(),
	tz: z.string(),
	dayIndex: z.number().min(0).max(6),
	interval: z.string().refine((val) => (Interval.fromISO(val).isValid ? true : 'Invalid interval')),
})
export const dayIndicies = ['0', '1', '2', '3', '4', '5', '6'] as DayIndex[]
export const isDayKey = (key: string): key is DayIndex => dayIndicies.includes(key as DayIndex)

export const getDayRecords = (data: ZFormSchema) =>
	Object.entries(data).reduce((data, [key, value]) => {
		if (isDayKey(key) && Array.isArray(value)) {
			data.push(...value)
		}
		return data
	}, [] as ZHourRecord[])

const BoolObj = z.object({
	'0': z.boolean().default(false),
	'1': z.boolean().default(false),
	'2': z.boolean().default(false),
	'3': z.boolean().default(false),
	'4': z.boolean().default(false),
	'5': z.boolean().default(false),
	'6': z.boolean().default(false),
})

export const FormSchema = z.object({
	'0': HourRecord.array().optional(),
	'1': HourRecord.array().optional(),
	'2': HourRecord.array().optional(),
	'3': HourRecord.array().optional(),
	'4': HourRecord.array().optional(),
	'5': HourRecord.array().optional(),
	'6': HourRecord.array().optional(),
	closed: BoolObj,
	open24hours: BoolObj,
	tz: z.string(),
})
export type ZFormSchema = z.infer<typeof FormSchema>
export type ZHourRecord = z.infer<typeof HourRecord>
export type DayIndex = '0' | '1' | '2' | '3' | '4' | '5' | '6'
