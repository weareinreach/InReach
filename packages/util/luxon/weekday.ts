import { type WeekdayNumbers } from 'luxon'

export const convertToLuxonWeekday = (dayIndex: number): WeekdayNumbers => {
	if (dayIndex < 0 || dayIndex > 6) throw new Error('Invalid day index')
	return (dayIndex + 1) as WeekdayNumbers
}
