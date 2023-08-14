import { DateTime } from 'luxon'

import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForHoursDrawerSchema } from './query.forHoursDrawer.schema'

export const forHoursDrawer = async ({ input }: TRPCHandlerParams<TForHoursDrawerSchema>) => {
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
	const transformedResult = result.map(({ start, end, ...rest }) => {
		return {
			start: DateTime.fromJSDate(start, { zone: rest.tz ?? 'America/New_York' }).toISOTime({
				suppressMilliseconds: true,
				suppressSeconds: true,
				includeOffset: false,
			}),
			end: DateTime.fromJSDate(end, { zone: rest.tz ?? 'America/New_York' }).toISOTime({
				suppressMilliseconds: true,
				suppressSeconds: true,
				includeOffset: false,
			}),
			...rest,
		}
	})
	return transformedResult
}
