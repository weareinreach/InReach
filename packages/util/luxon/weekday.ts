import { type WeekdayNumbers } from 'luxon'

export const convertToLuxonWeekday = (dayIndex: number): WeekdayNumbers => {
	if (dayIndex < 0 || dayIndex > 6) {
		throw new Error('Invalid day index')
	}
	return (dayIndex + 1) as WeekdayNumbers
}

export const shouldAddDay = (startTime: Date, endTime: Date, dayNum: number) => {
	const needToAddADay = startTime > endTime
	if (needToAddADay) {
		return dayNum === 6 ? 0 : dayNum + 1
	}
	return dayNum
}
export const shouldAdvanceWeekNum = (startTime: Date, endTime: Date, dayNum: number, weekNum: number) => {
	const needToAdvanceWeekNum = shouldAddDay(startTime, endTime, dayNum) !== dayNum && dayNum === 6
	if (needToAdvanceWeekNum) {
		return weekNum + 1
	}
	return weekNum
}
