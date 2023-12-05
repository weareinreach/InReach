import groupBy from 'just-group-by'
import { DateTime, Interval } from 'luxon'

import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForHoursDisplaySchema } from './query.forHoursDisplay.schema'

export const forHoursDisplay = async ({ input }: TRPCHandlerParams<TForHoursDisplaySchema>) => {
	const whereId = (): Prisma.OrgHoursWhereInput => {
		switch (true) {
			case isIdFor('organization', input): {
				return { organization: { id: input, ...globalWhere.isPublic() } }
			}
			case isIdFor('orgLocation', input): {
				return { orgLocation: { id: input, ...globalWhere.isPublic() } }
			}
			case isIdFor('orgService', input): {
				return { orgService: { id: input, ...globalWhere.isPublic() } }
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
		select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true },
		orderBy: [{ dayIndex: 'asc' }, { start: 'asc' }],
	})

	// TODO: alter db schema

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
	const grouped = groupBy(intervalResults, ({ dayIndex }) => dayIndex)
	return grouped
}
