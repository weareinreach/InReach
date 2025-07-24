import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForUserTableSchema } from './query.forUserTable.schema'

// Define the permission names and their corresponding IDs in hierarchical order
// This must match the IDs defined in your frontend's DATA_PORTAL_ACCESS_OPTIONS
const DATA_PORTAL_PERMISSIONS_HIERARCHY = [
	{ name: 'root', id: 'perm_01GW2HKXRTRWKY87HNTTFZCBH1' },
	{ name: 'dataPortalAdmin', id: 'perm_01H0QX1XC0335R04JMGMQ3KXVN' },
	{ name: 'dataPortalManager', id: 'perm_01H0QX1XC04Z9G8H44G464YHQQ' },
	{ name: 'dataPortalBasic', id: 'perm_01H0QX1XC037A47900JPAX6JBP' },
]

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
			// Select all user permissions that are authorized
			permissions: {
				where: { authorized: true }, // Only fetch authorized permissions
				select: { permission: { select: { id: true, name: true } } }, // Select both ID and name
			},
		},
	})

	const reformattedResults = userResults.map(({ permissions, ...user }) => {
		let activePermissionId: string | undefined = undefined // Initialize as undefined
		let canAccessDataPortal: boolean = false

		// Filter for only data portal related permissions that are active
		const activeDataPortalPermissions = permissions.filter((p) =>
			DATA_PORTAL_PERMISSIONS_HIERARCHY.some((dp) => dp.id === p.permission.id)
		)

		// Determine the single active permission ID based on hierarchy
		for (const level of DATA_PORTAL_PERMISSIONS_HIERARCHY) {
			if (activeDataPortalPermissions.some((p) => p.permission.id === level.id)) {
				activePermissionId = level.id
				canAccessDataPortal = true // If any data portal permission is active, access is granted
				break // Found the highest active permission, stop checking
			}
		}

		return {
			...user,
			canAccessDataPortal: canAccessDataPortal, // Boolean indicating if any access is granted
			permissionId: activePermissionId, // The specific permission ID (e.g., 'perm_...', or undefined)
		}
	})

	return reformattedResults
}
export default forUserTable
