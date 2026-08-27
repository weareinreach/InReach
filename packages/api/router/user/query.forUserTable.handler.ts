import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForUserTableSchema } from './query.forUserTable.schema'

// Define the permission names in hierarchical order (highest to lowest)
const DATA_PORTAL_ROLE_NAMES = ['root', 'dataPortalAdmin', 'dataPortalManager', 'dataPortalBasic']

const buildWhere = (input: TForUserTableSchema): Prisma.UserWhereInput => {
	// Built as top-level `AND` conditions (each its own object) rather than assigning multiple keys
	// directly on `where` - `search` and `permissionNames` each need their own `OR`, and a plain JS
	// object can only hold one `OR` key, so a second assignment would silently clobber the first.
	const and: Prisma.UserWhereInput[] = []
	if (input.active !== undefined) {
		and.push({ active: input.active })
	}
	if (input.createdAt) {
		and.push({ createdAt: { gte: input.createdAt.from, lte: input.createdAt.to } })
	}
	if (input.updatedAt) {
		and.push({ updatedAt: { gte: input.updatedAt.from, lte: input.updatedAt.to } })
	}
	if (input.search) {
		and.push({
			OR: [
				{ name: { contains: input.search, mode: 'insensitive' } },
				{ email: { contains: input.search, mode: 'insensitive' } },
			],
		})
	}
	if (input.permissionNames?.length) {
		const wantsNone = input.permissionNames.includes('none')
		const specificNames = input.permissionNames.filter((name) => name !== 'none')
		const permissionOr: Prisma.UserWhereInput[] = []
		if (wantsNone) {
			permissionOr.push({
				permissions: { none: { authorized: true, permission: { name: { in: DATA_PORTAL_ROLE_NAMES } } } },
			})
		}
		if (specificNames.length) {
			permissionOr.push({
				permissions: { some: { authorized: true, permission: { name: { in: specificNames } } } },
			})
		}
		if (permissionOr.length) {
			and.push({ OR: permissionOr })
		}
	}
	return and.length ? { AND: and } : {}
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
