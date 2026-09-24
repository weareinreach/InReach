import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForReportsTableSchema } from './query.forReportsTable.schema'

// Built as top-level `AND` conditions (each its own object) rather than assigning multiple keys directly
// on `where` - only `search` needs its own `OR` today, but this keeps the same shape as the Organization/
// Review/User table handlers so a future `OR`-based filter added here (a bucketed Status, say) can't
// silently clobber another one the way Organization's Status + Create Method briefly did (a plain JS
// object can only hold one `OR` key - see user/query.forUserTable.handler.ts for the same reasoning).
const buildWhere = (input: TForReportsTableSchema): Prisma.ReportWhereInput => {
	const and: Prisma.ReportWhereInput[] = []
	if (input.id) {
		and.push({ id: input.id })
	}
	if (input.status) {
		and.push({ status: input.status })
	}
	if (input.issueType?.length) {
		and.push({ issueType: { in: input.issueType } })
	}
	if (input.organizationId) {
		and.push({ organizationId: input.organizationId })
	}
	if (input.informed !== undefined) {
		and.push({ informed: input.informed })
	}
	if (input.createdByUserIds?.length) {
		and.push({ reportedById: { in: input.createdByUserIds } })
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
				{ orgNameSnapshot: { contains: input.search, mode: 'insensitive' } },
				{ serviceNameSnapshot: { contains: input.search, mode: 'insensitive' } },
				{ userName: { contains: input.search, mode: 'insensitive' } },
				{ userEmail: { contains: input.search, mode: 'insensitive' } },
				{ userNote: { contains: input.search, mode: 'insensitive' } },
			],
		})
	}
	return and.length ? { AND: and } : {}
}

// Sortable columns are whitelisted by the Zod schema (ZSortableColumn) before they ever reach here.
const buildOrderBy = (
	sorting: TForReportsTableSchema['sorting']
): Prisma.ReportOrderByWithRelationInput[] => {
	const orderBy: Prisma.ReportOrderByWithRelationInput[] = (sorting ?? [{ id: 'createdAt', desc: true }]).map(
		({ id, desc }) => ({ [id]: desc ? 'desc' : 'asc' })
	)
	// Stable tiebreaker so take/skip pagination can't skip or duplicate rows across pages.
	orderBy.push({ id: 'asc' })
	return orderBy
}

const forReportsTable = async ({ input }: TRPCHandlerParams<TForReportsTableSchema>) => {
	const where = buildWhere(input)
	const orderBy = buildOrderBy(input.sorting)

	const [results, total] = await Promise.all([
		prisma.report.findMany({
			where,
			orderBy,
			take: input.take,
			skip: input.skip,
			select: {
				id: true,
				organizationId: true,
				orgNameSnapshot: true,
				serviceId: true,
				serviceNameSnapshot: true,
				issueType: true,
				status: true,
				informed: true,
				userEmail: true,
				userName: true,
				userNote: true,
				incorrectFields: true,
				internalNotes: {
					select: {
						id: true,
						text: true,
						createdAt: true,
						user: {
							select: {
								name: true,
							},
						},
					},
				},
				language: true,
				createdAt: true,
				updatedAt: true,
				organization: {
					select: {
						slug: true,
					},
				},
				reportedBy: {
					select: {
						id: true,
						name: true,
					},
				},
				handledBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		}),
		prisma.report.count({ where }),
	])
	return { results, total }
}

export default forReportsTable
