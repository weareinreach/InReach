import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForUserTableSchema } from './query.forUserTable.schema'

// Define the permission names in hierarchical order (highest to lowest)
const DATA_PORTAL_ROLE_NAMES = ['root', 'dataPortalAdmin', 'dataPortalManager', 'dataPortalBasic']

const buildWhere = (input: TForUserTableSchema): Prisma.UserWhereInput => {
	const where: Prisma.UserWhereInput = {}
	if (input.active !== undefined) {
		where.active = input.active
	}
	if (input.search) {
		where.OR = [
			{ name: { contains: input.search, mode: 'insensitive' } },
			{ email: { contains: input.search, mode: 'insensitive' } },
		]
	}
	return where
}

// Sortable columns are whitelisted by the Zod schema (ZSortableColumn) before they ever reach here.
const buildOrderBy = (sorting: TForUserTableSchema['sorting']): Prisma.UserOrderByWithRelationInput[] => {
	const orderBy: Prisma.UserOrderByWithRelationInput[] = (sorting ?? [{ id: 'name', desc: false }]).map(
		({ id, desc }) => ({ [id]: desc ? 'desc' : 'asc' })
	)
	// Stable tiebreaker so take/skip pagination can't skip or duplicate rows across pages.
	orderBy.push({ id: 'asc' })
	return orderBy
}

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

	const where = buildWhere(input)
	const orderBy = buildOrderBy(input.sorting)

	const [userResults, total] = await Promise.all([
		prisma.user.findMany({
			where,
			orderBy,
			take: input.take,
			skip: input.skip,
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
		}),
		prisma.user.count({ where }),
	])

	const results = userResults.map(({ permissions, ...user }) => {
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

	return { results, total }
}
export default forUserTable
