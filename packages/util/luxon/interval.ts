import { DateTime, Interval } from 'luxon'

import { convertToLuxonWeekday, shouldAddDay, shouldAdvanceWeekNum } from './weekday'

const { weekYear, weekNumber } = DateTime.now()
export const generateHoursInterval = ({ start, end, dayIndex, tz }: GenerateHoursIntervalParams) => {
	const open = DateTime.fromJSDate(start, { zone: tz ?? 'America/New_York' }).set({
		weekday: convertToLuxonWeekday(dayIndex),
		weekYear,
		weekNumber,
	})
	const close = DateTime.fromJSDate(end, { zone: tz ?? 'America/New_York' }).set({
		weekday: convertToLuxonWeekday(shouldAddDay(start, end, dayIndex)),
		weekNumber: shouldAdvanceWeekNum(start, end, dayIndex, weekNumber),
		weekYear,
	})
	const interval = Interval.fromDateTimes(open, close).toISO()

	return interval
}

interface GenerateHoursIntervalParams {
	start: Date
	end: Date
	dayIndex: number
	tz: string | null
}
