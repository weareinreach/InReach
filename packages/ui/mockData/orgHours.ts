import compact from 'just-compact'
import { DateTime, Interval } from 'luxon'

import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

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
		DateTime.fromFormat(start, 'HH:mm', { zone: tz }).set({ weekday: dayIndex, weekYear, weekNumber }),
		DateTime.fromFormat(end, 'HH:mm', { zone: tz }).set({ weekday: dayIndex, weekYear, weekNumber })
	)
	if (!interval.isValid) throw new Error('Invalid interval')

	// return toString ? interval.toISO() : interval
	return interval.toISO()
}
type Time = `${string}:${string}`

export const orgHoursData = {
	forHoursDisplay: {
		1: [
			{
				id: 'ohrs_01GW2HT8CP5HHCF2XBF9EGAJ6B',
				dayIndex: 1,
				interval: createInterval('08:00', '12:00', 1, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
			{
				id: 'ohrs_01GW2HT8CQHH5YKE1GTM2P4EWD',
				dayIndex: 1,
				interval: createInterval('13:00', '16:00', 1, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
		],
		2: [
			{
				id: 'ohrs_01GW2HT8CPVWH1JYX1MW1PM4PG',
				dayIndex: 2,
				interval: createInterval('08:00', '10:00', 2, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
			{
				id: 'ohrs_01GW2HT8CQA1K5BHKRF2BR90SY',
				dayIndex: 2,
				interval: createInterval('10:30', '13:00', 2, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
			{
				id: 'ohrs_01GW2HT8CRZK6Y2P4DHCR6ZJHM',
				dayIndex: 2,
				interval: createInterval('13:30', '17:00', 2, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
		],
		3: [
			{
				id: 'ohrs_01GW2HT8CQDXMWWDW1FK7W8TV7',
				dayIndex: 3,
				interval: createInterval('08:00', '17:00', 3, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
		],
		4: [
			{
				id: 'ohrs_01GW2HT8CQGR2M2BNBRWE94PS5',
				dayIndex: 4,
				interval: createInterval('08:00', '17:00', 4, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
		],

		5: [
			{
				id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1MFH',
				dayIndex: 5,
				interval: createInterval('08:00', '17:00', 5, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
		],
		6: [
			{
				id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1VER',
				dayIndex: 6,
				interval: createInterval('00:00', '23:59', 6, 'America/New_York'),
				closed: false,
				tz: 'America/New_York',
			},
		],
		0: [
			{
				id: 'ohrs_01GW2HT8CQFZHK6TD586TJ7BJH',
				dayIndex: 0,
				interval: createInterval('00:00', '23:59', 0, 'America/New_York'),
				closed: true,
				tz: 'America/New_York',
			},
		],
	},
	forHoursDrawer: [
		{
			id: 'ohrs_01GW2HT8CP5HHCF2XBF9EGAJ6B',
			dayIndex: 1,
			interval: createInterval('08:00', '12:00', 1, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CQHH5YKE1GTM2P4EWD',
			dayIndex: 1,
			interval: createInterval('13:00', '16:00', 1, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CPVWH1JYX1MW1PM4PG',
			dayIndex: 2,
			interval: createInterval('08:00', '10:00', 2, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CQA1K5BHKRF2BR90SY',
			dayIndex: 2,
			interval: createInterval('10:30', '13:00', 2, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CRZK6Y2P4DHCR6ZJHM',
			dayIndex: 2,
			interval: createInterval('13:30', '17:00', 2, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CQDXMWWDW1FK7W8TV7',
			dayIndex: 3,
			interval: createInterval('08:00', '17:00', 3, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CQGR2M2BNBRWE94PS5',
			dayIndex: 4,
			interval: createInterval('08:00', '17:00', 4, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1MFH',
			dayIndex: 5,
			interval: createInterval('08:00', '17:00', 5, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: false,
		},
		{
			id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1VER',
			dayIndex: 6,
			interval: createInterval('00:00', '23:59', 6, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: true,
		},
		{
			id: 'ohrs_01GW2HT8CQFZHK6TD586TJ7BJH',
			dayIndex: 0,
			interval: createInterval('00:00', '23:59', 0, 'America/New_York', true),
			closed: false,
			tz: 'America/New_York',
			open24hours: true,
		},
	],
	processDrawer: (data) => {
		const replacementVals = compact([data.createdVals, data.updatedVals, data.deletedVals].flat())
		const valueSet = new Set([
			...replacementVals.map((val) => JSON.stringify(val)),
			...orgHoursData.forHoursDrawer.map((val) => JSON.stringify(val)),
		])
		const newValues = [...valueSet].map((val) => JSON.parse(val))
		orgHoursData.forHoursDrawer = newValues
		return {
			created: data.createdVals?.length ?? 0,
			updated: data.updatedVals?.length ?? 0,
			deleted: data.deletedVals?.length ?? 0,
		}
	},
} satisfies MockDataObject<'orgHours'>

export const orgHours = {
	forHoursDisplay: getTRPCMock({
		path: ['orgHours', 'forHoursDisplay'],
		response: orgHoursData.forHoursDisplay,
	}),
	forHoursDrawer: getTRPCMock({
		path: ['orgHours', 'forHoursDrawer'],
		response: orgHoursData.forHoursDrawer,
	}),
	processDrawer: getTRPCMock({
		path: ['orgHours', 'processDrawer'],
		response: orgHoursData.processDrawer,
		type: 'mutation',
	}),
} satisfies MockHandlerObject<'orgHours'>
