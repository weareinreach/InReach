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
		},
	})
	return userResults
}
export default forUserTable
