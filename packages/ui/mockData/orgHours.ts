import { DateTime, Interval } from 'luxon'

import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

const createInterval = (start: Time, end: Time) =>
	Interval.fromDateTimes(DateTime.fromFormat(start, 'HH:mm'), DateTime.fromFormat(end, 'HH:mm'))
type Time = `${string}:${string}`

export const orgHoursData = {
	forHoursDisplay: [
		{
			id: 'ohrs_01GW2HT8CP5HHCF2XBF9EGAJ6B',
			dayIndex: 1,
			interval: createInterval('08:00', '12:00'),
			closed: false,
			tz: 'America/New_York',
		},
		{
			id: 'ohrs_01GW2HT8CQHH5YKE1GTM2P4EWD',
			dayIndex: 1,
			interval: createInterval('13:00', '16:00'),
			closed: false,
			tz: 'America/New_York',
		},
		{
			id: 'ohrs_01GW2HT8CPVWH1JYX1MW1PM4PG',
			dayIndex: 2,
			interval: createInterval('08:00', '10:00'),
			closed: false,
			tz: 'America/New_York',
		},
		{
			id: 'ohrs_01GW2HT8CQA1K5BHKRF2BR90SY',
			dayIndex: 2,
			interval: createInterval('10:30', '13:00'),
			closed: false,
			tz: 'America/New_York',
		},
		{
			id: 'ohrs_01GW2HT8CRZK6Y2P4DHCR6ZJHM',
			dayIndex: 2,
			interval: createInterval('13:30', '17:00'),
			closed: false,
			tz: 'America/New_York',
		},
		{
			id: 'ohrs_01GW2HT8CQDXMWWDW1FK7W8TV7',
			dayIndex: 3,
			interval: createInterval('08:00', '17:00'),
			closed: false,
			tz: 'America/New_York',
		},

		{
			id: 'ohrs_01GW2HT8CQGR2M2BNBRWE94PS5',
			dayIndex: 4,
			interval: createInterval('08:00', '17:00'),
			closed: false,
			tz: 'America/New_York',
		},

		{
			id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1MFH',
			dayIndex: 5,
			interval: createInterval('08:00', '17:00'),
			closed: false,
			tz: 'America/New_York',
		},
	],
} satisfies MockDataObject<'orgHours'>

export const orgHours = {
	forHoursDisplay: getTRPCMock({
		path: ['orgHours', 'forHoursDisplay'],
		response: orgHoursData.forHoursDisplay,
	}),
} satisfies MockHandlerObject<'orgHours'>
