import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { generateHoursInterval } from '@weareinreach/util/luxon/interval'
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

const forHoursDrawer = async ({ input }: TRPCHandlerParams<TForHoursDrawerSchema>) => {
	const result = await prisma.orgHours.findMany({
		where: {
			...whereId(input),
		},
		select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true, open24hours: true },
		orderBy: [{ dayIndex: 'asc' }, { start: 'asc' }],
	})

	const intervalResults = result.map(({ start, end, tz, dayIndex, ...rest }) => {
		const interval = generateHoursInterval({ start, end, tz, dayIndex })
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
