import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgHoursData = {
	forHoursDisplay: [
		{
			id: 'ohrs_01GW2HT8CP5HHCF2XBF9EGAJ6B',
			dayIndex: 1,
			start: new Date('1970-01-01T12:30:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CQHH5YKE1GTM2P4EWD',
			dayIndex: 1,
			start: new Date('1970-01-01T13:00:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CPVWH1JYX1MW1PM4PG',
			dayIndex: 2,
			start: new Date('1970-01-01T12:30:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CQA1K5BHKRF2BR90SY',
			dayIndex: 2,
			start: new Date('1970-01-01T13:00:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CRZK6Y2P4DHCR6ZJHM',
			dayIndex: 2,
			start: new Date('1970-01-01T21:00:00.000Z'),
			end: new Date('1970-01-01T23:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CQDXMWWDW1FK7W8TV7',
			dayIndex: 3,
			start: new Date('1970-01-01T13:00:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CQAMHB31FBSM50X3XY',
			dayIndex: 3,
			start: new Date('1970-01-01T14:30:00.000Z'),
			end: new Date('1970-01-01T23:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CQGR2M2BNBRWE94PS5',
			dayIndex: 4,
			start: new Date('1970-01-01T12:30:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CRXC9DNS84J58SAEXC',
			dayIndex: 4,
			start: new Date('1970-01-01T13:00:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CQFZHK6TD586TJ1MFH',
			dayIndex: 5,
			start: new Date('1970-01-01T12:30:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
			closed: false,
			tz: 'America/Los_Angeles',
		},
		{
			id: 'ohrs_01GW2HT8CRYSY877GSPEZ4899T',
			dayIndex: 5,
			start: new Date('1970-01-01T13:00:00.000Z'),
			end: new Date('1970-01-01T21:00:00.000Z'),
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
} satisfies MockHandlerObject<'orgHours'>
