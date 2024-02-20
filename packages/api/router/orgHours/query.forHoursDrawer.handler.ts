import { DateTime, Interval } from 'luxon'

import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { convertToLuxonWeekday } from '@weareinreach/util/luxon/weekday'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForHoursDrawerSchema } from './query.forHoursDrawer.schema'

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
				weekday: convertToLuxonWeekday(dayIndex),
				weekYear,
				weekNumber,
			}),
			DateTime.fromJSDate(end, { zone: tz ?? 'America/New_York' }).set({
				weekday: convertToLuxonWeekday(dayIndex),
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
	return intervalResults
}
export default forHoursDrawer
