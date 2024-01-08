import { DateTime, Interval } from 'luxon'

import { convertToLuxonWeekday } from '@weareinreach/util/luxon/weekday'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export function createInterval(start: Time, end: Time, dayIndex: number, tz: string, toString?: false): string // Interval<true>
export function createInterval(start: Time, end: Time, dayIndex: number, tz: string, toString?: true): string
export function createInterval(
	start: Time,
	end: Time,
	dayIndex: number,
	tz: string,
	toString?: boolean
): string /*| Interval<true> */ {
	const { weekYear, weekNumber } = DateTime.now()
	const interval = Interval.fromDateTimes(
		DateTime.fromFormat(start, 'HH:mm', { zone: tz }).set({
			weekday: convertToLuxonWeekday(dayIndex),
			weekYear,
			weekNumber,
		}),
		DateTime.fromFormat(end, 'HH:mm', { zone: tz }).set({
			weekday: convertToLuxonWeekday(dayIndex),
			weekYear,
			weekNumber,
		})
	)
	if (!interval.isValid) throw new Error('Invalid interval')

	// return toString ? interval.toISO() : interval
	return interval.toISO()
}
type Time = `${string}:${string}`

export const orgHours = {
	forHoursDisplay: getTRPCMock({
		path: ['orgHours', 'forHoursDisplay'],
		response: async () => {
			const { default: data } = await import('./json/orgHours.forHoursDisplay.json')
			return data
		},
	}),
	forHoursDrawer: getTRPCMock({
		path: ['orgHours', 'forHoursDrawer'],
		response: async () => {
			const { default: data } = await import('./json/orgHours.forHoursDrawer.json')
			return data
		},
	}),
	processDrawer: getTRPCMock({
		path: ['orgHours', 'processDrawer'],
		type: 'mutation',
		response: async (data) => ({
			created: data.createdVals?.length ?? 0,
			updated: data.updatedVals?.length ?? 0,
			deleted: data.deletedVals?.length ?? 0,
		}),
	}),
} satisfies MockHandlerObject<'orgHours'>
