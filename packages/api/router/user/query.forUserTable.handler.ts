import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForUserTableSchema } from './query.forUserTable.schema'

const forUserTable = async ({ input }: TRPCHandlerParams<TForUserTableSchema>) => {
	const userResults = await prisma.user.findMany({
		where: input,
		select: {
			id: true,
			name: true,
			email: true,
			active: true,
			createdAt: true,
			emailVerified: true,
			updatedAt: true,
			permissions: {
				where: { permission: { name: 'root' } },
				select: { permission: { select: { name: true } }, authorized: true },
			},
		},
	})
	const reformattedResults = userResults.map(({ permissions, ...user }) => ({
		...user,
		canAccessDataPortal: permissions.some(({ authorized }) => authorized),
	}))
	return reformattedResults
}
export default forUserTable
