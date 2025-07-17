import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForUserTableSchema } from './query.forUserTable.schema'

const ROOT_PERMISSION_ID = 'perm_01GW2HKXRTRWKY87HNTTFZCBH1'

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
				where: { permissionId: ROOT_PERMISSION_ID },
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
