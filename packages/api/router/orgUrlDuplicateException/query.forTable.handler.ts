import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { findMatchingOrgs } from './lib/matchingOrgs'
import { type TForTableSchema } from './query.forTable.schema'

const buildWhere = (input: TForTableSchema): Prisma.OrgUrlDuplicateExceptionWhereInput => {
	// Built as top-level `AND` conditions (each its own object) rather than assigning multiple keys
	// directly on `where` - `search` needs its own `OR`, and a plain JS object can only hold one `OR`
	// key, so a second assignment would silently clobber the first.
	const and: Prisma.OrgUrlDuplicateExceptionWhereInput[] = []
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
				{ baseUrl: { contains: input.search, mode: 'insensitive' } },
				{ description: { contains: input.search, mode: 'insensitive' } },
			],
		})
	}
	return and.length ? { AND: and } : {}
}

// Sortable columns are whitelisted by the Zod schema (ZSortableColumn) before they ever reach here.
const buildOrderBy = (
	sorting: TForTableSchema['sorting']
): Prisma.OrgUrlDuplicateExceptionOrderByWithRelationInput[] => {
	const orderBy: Prisma.OrgUrlDuplicateExceptionOrderByWithRelationInput[] = (
		sorting ?? [{ id: 'baseUrl', desc: false }]
	).map(({ id, desc }) => ({ [id]: desc ? 'desc' : 'asc' }))
	// Stable tiebreaker so take/skip pagination can't skip or duplicate rows across pages.
	orderBy.push({ id: 'asc' })
	return orderBy
}

const forTable = async ({ input }: TRPCHandlerParams<TForTableSchema, 'protected'>) => {
	const where = buildWhere(input)
	const orderBy = buildOrderBy(input.sorting)

	const [rows, total] = await Promise.all([
		prisma.orgUrlDuplicateException.findMany({
			where,
			orderBy,
			take: input.take,
			skip: input.skip,
			select: {
				id: true,
				baseUrl: true,
				description: true,
				active: true,
				createdAt: true,
				updatedAt: true,
				createdBy: { select: { id: true, name: true, email: true } },
			},
		}),
		prisma.orgUrlDuplicateException.count({ where }),
	])

	// Eagerly attached per row (not a separate on-demand query triggered by expanding it) - this table is
	// small and staff-curated, so loading every current page's matches up front is cheap, and matches the
	// existing convention elsewhere (e.g. OrganizationTable's locations) of the main query already
	// including everything a row can expand to show.
	const results = await Promise.all(
		rows.map(async (row) => ({ ...row, matchingOrgs: await findMatchingOrgs(row.baseUrl) }))
	)

	return { results, total }
}
export default forTable
