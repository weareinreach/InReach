import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForUserTableSchema } from './query.forUserTable.schema'

// Define the permission names in hierarchical order (highest to lowest)
const DATA_PORTAL_ROLE_NAMES = ['root', 'dataPortalAdmin', 'dataPortalManager', 'dataPortalBasic']

const forUserTable = async ({ input }: TRPCHandlerParams<TForUserTableSchema, 'protected'>) => {
	// Dynamically fetch the IDs for the data portal roles
	const portalPermissions = await prisma.permission.findMany({
		where: { name: { in: DATA_PORTAL_ROLE_NAMES } },
		select: { id: true, name: true },
	})

	// Reconstruct the hierarchy with the fetched IDs, maintaining the order of DATA_PORTAL_ROLE_NAMES
	const hierarchy = DATA_PORTAL_ROLE_NAMES.map((name) =>
		portalPermissions.find((p) => p.name === name)
	).filter((p): p is { id: string; name: string } => !!p)

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
		let activePermissionName: string | undefined = undefined
		let canAccessDataPortal: boolean = false

		// Filter for only data portal related permissions that are active
		const activeDataPortalPermissions = permissions.filter((p) =>
			hierarchy.some((dp) => dp.id === p.permission.id)
		)

		// Determine the single active permission ID based on hierarchy
		for (const level of hierarchy) {
			if (activeDataPortalPermissions.some((p) => p.permission.id === level.id)) {
				activePermissionId = level.id
				activePermissionName = level.name
				canAccessDataPortal = true // If any data portal permission is active, access is granted
				break // Found the highest active permission, stop checking
			}
		}

		return {
			...user,
			canAccessDataPortal: canAccessDataPortal, // Boolean indicating if any access is granted
			permissionId: activePermissionId, // The specific permission ID (e.g., 'perm_...', or undefined)
			permissionName: activePermissionName, // The specific permission Name
		}
	})

	return reformattedResults
}
export default forUserTable
