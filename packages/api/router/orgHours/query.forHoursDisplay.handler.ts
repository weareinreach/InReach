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
	return result
}
