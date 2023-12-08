import groupBy from 'just-group-by'
import { DateTime, Interval } from 'luxon'
import { type LiteralUnion } from 'type-fest'

import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForHoursDrawerSchema } from './query.forHoursDrawer.schema'

const dayIndicies = ['0', '1', '2', '3', '4', '5', '6'] as const

type DataKeys = (typeof dayIndicies)[number]

const whereId = (input: TForHoursDrawerSchema): Prisma.OrgHoursWhereInput => {
	switch (true) {
		case isIdFor('organization', input): {
			return { organization: { id: input } }
		}
		case isIdFor('orgLocation', input): {
			return { orgLocation: { id: input } }
		}
		case isIdFor('orgService', input): {
			return { orgService: { id: input } }
		}
		default: {
			return {}
		}
	}
}

const { weekYear, weekNumber } = DateTime.now()

export const forHoursDrawer = async ({ input }: TRPCHandlerParams<TForHoursDrawerSchema>) => {
	const result = await prisma.orgHours.findMany({
		where: {
			...whereId(input),
		},
		select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true, open24hours: true },
		orderBy: [{ dayIndex: 'asc' }, { start: 'asc' }],
	})

	const tzMap = new Map<string, number>()
	const intervalResults = result.map(({ start, end, tz, dayIndex, ...rest }) => {
		if (tz) {
			if (tzMap.has(tz)) {
				tzMap.set(tz, tzMap.get(tz)! + 1)
			} else {
				tzMap.set(tz, 1)
			}
		}

		const interval = Interval.fromDateTimes(
			DateTime.fromJSDate(start, { zone: tz ?? 'America/New_York' }).set({
				weekday: dayIndex,
				weekYear,
				weekNumber,
			}),
			DateTime.fromJSDate(end, { zone: tz ?? 'America/New_York' }).set({
				weekday: dayIndex,
				weekYear,
				weekNumber,
			})
		).toISO()
		return {
			tz: tz ?? 'America/New_York',
			dayIndex,
			...rest,
			interval,
		}
	})
	// move grouping to component
	// const groupedData = groupBy<(typeof intervalResults)[number], LiteralUnion<DataKeys, number>>(
	// 	intervalResults,
	// 	({ dayIndex }) =>
	// 		typeof dayIndex === 'number' && dayIndex >= 0 && dayIndex <= 6
	// 			? (dayIndex.toString() as DataKeys)
	// 			: dayIndex
	// )
	// const closed = Object.fromEntries(
	// 	dayIndicies.map((i) => [i.toString(), groupedData[i]?.some((d) => d.closed) ?? false])
	// ) as { [key in DataKeys]: boolean }
	// const open24hours = Object.fromEntries(
	// 	dayIndicies.map((i) => [i.toString(), groupedData[i]?.some((d) => d.open24hours) ?? false])
	// ) as { [key in DataKeys]: boolean }
	// const tzObj = Object.fromEntries(tzMap.entries())
	// // get the timezone with the most occurrences
	// const tz = Object.keys(tzObj).reduce((a, b) => ((tzObj[a] ?? 0) > (tzObj[b] ?? 0) ? a : b))

	// return { ...groupedData, closed, open24hours, tz }
	return intervalResults
}
