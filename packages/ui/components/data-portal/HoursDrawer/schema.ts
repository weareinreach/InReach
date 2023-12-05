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

export const FormSchema = z.record(
	z.enum(['0', '1', '2', '3', '4', '5', '6']),
	z
		.object({
			id: prefixedId('orgHours'),
			closed: z.boolean(),
			open24hours: z.boolean(),
			tz: z.string(),
			dayIndex: z.number().min(0).max(6),
			interval: z.custom<Interval<true>>((val) => Interval.isInterval(val)),
		})
		.array()
)
