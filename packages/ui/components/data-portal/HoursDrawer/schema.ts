import { Interval } from 'luxon'
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
	interval: z.custom<Interval<true>>((val) => Interval.isInterval(val)),
})
export const dayIndicies = ['0', '1', '2', '3', '4', '5', '6'] as DayIndex[]

export const FormSchema = z.object({
	'0': HourRecord.array().optional(),
	'1': HourRecord.array().optional(),
	'2': HourRecord.array().optional(),
	'3': HourRecord.array().optional(),
	'4': HourRecord.array().optional(),
	'5': HourRecord.array().optional(),
	'6': HourRecord.array().optional(),
	closed: z.record(z.enum(dayIndicies as [string, ...string[]]), z.boolean().default(false)),
	open24hours: z.record(z.enum(dayIndicies as [string, ...string[]]), z.boolean().default(false)),
	tz: z.string(),
})
export type ZFormSchema = z.infer<typeof FormSchema>
export type DayIndex = '0' | '1' | '2' | '3' | '4' | '5' | '6'
