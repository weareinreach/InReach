import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForReportsTableSchema } from './query.forReportsTable.schema'

const buildWhere = (input: TForReportsTableSchema): Prisma.ReportWhereInput => {
	const where: Prisma.ReportWhereInput = {}
	if (input.id) where.id = input.id
	if (input.status) where.status = input.status
	if (input.issueType?.length) where.issueType = { in: input.issueType }
	if (input.organizationId) where.organizationId = input.organizationId
	if (input.informed !== undefined) where.informed = input.informed
	if (input.search) {
		where.OR = [
			{ orgNameSnapshot: { contains: input.search, mode: 'insensitive' } },
			{ serviceNameSnapshot: { contains: input.search, mode: 'insensitive' } },
			{ userName: { contains: input.search, mode: 'insensitive' } },
			{ userEmail: { contains: input.search, mode: 'insensitive' } },
			{ userNote: { contains: input.search, mode: 'insensitive' } },
		]
	}
	return where
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
