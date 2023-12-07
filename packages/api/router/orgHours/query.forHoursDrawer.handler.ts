import groupBy from 'just-group-by'
import { DateTime, Interval } from 'luxon'

import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForHoursDrawerSchema } from './query.forHoursDrawer.schema'

export const forHoursDrawer = async ({ input }: TRPCHandlerParams<TForHoursDrawerSchema>) => {
	const whereId = (): Prisma.OrgHoursWhereInput => {
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

	const result = await prisma.orgHours.findMany({
		where: {
			...whereId(),
		},
		select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true, open24hours: true },
		orderBy: [{ dayIndex: 'asc' }, { start: 'asc' }],
	})
	// const transformedResult = result.map(({ start, end, ...rest }) => {
	// 	return {
	// 		start: DateTime.fromJSDate(start, { zone: rest.tz ?? 'America/New_York' }).toISOTime({
	// 			suppressMilliseconds: true,
	// 			suppressSeconds: true,
	// 			includeOffset: false,
	// 		}),
	// 		end: DateTime.fromJSDate(end, { zone: rest.tz ?? 'America/New_York' }).toISOTime({
	// 			suppressMilliseconds: true,
	// 			suppressSeconds: true,
	// 			includeOffset: false,
	// 		}),
	// 		...rest,
	// 	}
	// })
	// return transformedResult
	const { weekYear, weekNumber } = DateTime.now()
	const intervalResults = result.map(({ start, end, tz, dayIndex, ...rest }) => {
		const interval = Interval.fromDateTimes(
			DateTime.fromJSDate(start, { zone: tz ?? 'America/New_York' }).set({
				weekday: dayIndex,
				weekYear,
				weekNumber,
			}),
			DateTime.fromJSDate(end, { zone: tz ?? 'America/New_York' }).set({
				weekday: dayIndex,
				weekYear,
				weekNumber,
			})
		)
		return {
			tz,
			dayIndex,
			...rest,
			interval,
		}
	})
	const grouped = groupBy(intervalResults, ({ dayIndex }) => dayIndex.toString())
	return grouped
}
