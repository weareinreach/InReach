import groupBy from 'just-group-by'
import { DateTime, Interval } from 'luxon'

import { type Prisma } from '@weareinreach/db'
import { convertToLuxonWeekday } from '@weareinreach/util/luxon/weekday'

const { weekYear, weekNumber } = DateTime.now()
export const formatHours = {
	prismaSelect: (showAll?: boolean) => ({
		...(showAll
			? {}
			: ({
					where: { active: true },
				} as const)),
		select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true } as const,
		orderBy: [
			{ dayIndex: 'asc' },
			{ start: 'asc' },
		] satisfies Prisma.OrgHoursOrderByWithRelationAndSearchRelevanceInput[],
	}),
	process: (data: HoursData) =>
		groupBy(
			data.map(({ start, end, tz, dayIndex, ...rest }) => {
				const interval = Interval.fromDateTimes(
					DateTime.fromJSDate(start, { zone: tz ?? 'America/New_York' }).set({
						weekday: convertToLuxonWeekday(dayIndex),
						weekYear,
						weekNumber,
					}),
					DateTime.fromJSDate(end, { zone: tz ?? 'America/New_York' }).set({
						weekday: convertToLuxonWeekday(start > end ? dayIndex + 1 : dayIndex),
						weekYear,
						weekNumber,
					})
				).toISO()
				return {
					tz,
					dayIndex,
					...rest,
					interval,
				}
			}),
			({ dayIndex }) => dayIndex
		),
}

type HoursData = {
	id: string
	end: Date
	dayIndex: number
	start: Date
	closed: boolean
	tz: string | null
}[]
