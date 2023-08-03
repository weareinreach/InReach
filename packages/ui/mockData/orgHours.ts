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
		{
			id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1MFH',
			dayIndex: 6,
			interval: createInterval('00:00', '00:00'),
			closed: false,
			tz: 'America/New_York',
		},
		{
			id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1MFH',
			dayIndex: 0,
			interval: createInterval('00:00', '00:00'),
			closed: true,
			tz: 'America/New_York',
		},
	],
	forHoursDrawer: [
		{
			start: '05:00',
			end: '12:00',
			id: 'ohrs_01GW2HT8BQ87EZJ6K9H5ME1W0M',
			dayIndex: 1,
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			start: '13:00',
			end: '16:00',
			id: 'ohrs_01GW2HT8BQQ6GM1VYVXEZMR3HM',
			dayIndex: 2,
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			start: '08:00',
			end: '12:00',
			id: 'ohrs_01GW2HT8BRB9V0GEP1BGWVNCGA',
			dayIndex: 2,
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			start: '05:00',
			end: '13:00',
			id: 'ohrs_01GW2HT8BRXRB7QH0BTRVVE1XB',
			dayIndex: 3,
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			start: '05:00',
			end: '13:00',
			id: 'ohrs_01GW2HT8BQKTD5Z92YSKHQ03PA',
			dayIndex: 4,
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			start: '08:00',
			end: '13:00',
			id: 'ohrs_01GW2HT8BS0YGWY4J7KTX3C4VA',
			dayIndex: 5,
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			start: '14:00',
			end: '17:00',
			id: 'ohrs_01GW2HT8BQX6XYNSVYH4S26MT0',
			dayIndex: 5,
			closed: false,
			tz: 'America/Los_Angeles',
		},
	],
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
} satisfies MockHandlerObject<'orgHours'>
