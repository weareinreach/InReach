import groupBy from 'just-group-by'

import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { generateHoursInterval } from '@weareinreach/util/luxon/interval'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForHoursDisplaySchema } from './query.forHoursDisplay.schema'

const forHoursDisplay = async ({ input }: TRPCHandlerParams<TForHoursDisplaySchema>) => {
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
	if (!result.length) {
		return null
	}

	const intervalResults = result.map(({ start, end, tz, dayIndex, ...rest }) => {
		const interval = generateHoursInterval({ start, end, tz, dayIndex })
		return {
			tz,
			dayIndex,
			...rest,
			interval,
		}
	})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const grouped = groupBy(intervalResults, (item: any) => item.dayIndex)
	return grouped
}
export default forHoursDisplay
