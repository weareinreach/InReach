import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForReviewTableSchema } from './query.forReviewTable.schema'

const buildWhere = (input: TForReviewTableSchema): Prisma.OrgReviewWhereInput => {
	const where: Prisma.OrgReviewWhereInput = {}
	if (input.visible !== undefined) {
		where.visible = input.visible
	}
	if (input.deleted !== undefined) {
		where.deleted = input.deleted
	}
	if (input.rating !== undefined) {
		where.rating = input.rating
	}
	if (input.createdAt) {
		where.createdAt = { gte: input.createdAt.from, lte: input.createdAt.to }
	}
	if (input.updatedAt) {
		where.updatedAt = { gte: input.updatedAt.from, lte: input.updatedAt.to }
	}
	if (input.search) {
		where.OR = [
			{ reviewText: { contains: input.search, mode: 'insensitive' } },
			{ user: { name: { contains: input.search, mode: 'insensitive' } } },
			{ user: { email: { contains: input.search, mode: 'insensitive' } } },
			{ organization: { name: { contains: input.search, mode: 'insensitive' } } },
			{ orgLocation: { name: { contains: input.search, mode: 'insensitive' } } },
		]
	}
	return where
}

// Sortable columns are whitelisted by the Zod schema (ZSortableColumn) before they ever reach here.
// `userName`/`userEmail`/`organization` aren't plain columns on `OrgReview` - they live on the
// related `User`/`Organization` records, so they need a nested `orderBy` instead of the flat
// `{ [id]: dir }` shape that works for the rest.
const buildOrderBy = (
	sorting: TForReviewTableSchema['sorting']
): Prisma.OrgReviewOrderByWithRelationInput[] => {
	const orderBy: Prisma.OrgReviewOrderByWithRelationInput[] = (
		sorting ?? [{ id: 'createdAt', desc: true }]
	).map(({ id, desc }) => {
		const dir = desc ? 'desc' : 'asc'
		switch (id) {
			case 'userName': {
				return { user: { name: dir } }
			}
			case 'userEmail': {
				return { user: { email: dir } }
			}
			case 'organization': {
				return { organization: { name: dir } }
			}
			default: {
				return { [id]: dir }
			}
		}
	})
	// Stable tiebreaker so take/skip pagination can't skip or duplicate rows across pages.
	orderBy.push({ id: 'asc' })
	return orderBy
}

const forReviewTable = async ({ input }: TRPCHandlerParams<TForReviewTableSchema>) => {
	const where = buildWhere(input)
	const orderBy = buildOrderBy(input.sorting)

	const [results, total] = await Promise.all([
		prisma.orgReview.findMany({
			where,
			orderBy,
			take: input.take,
			skip: input.skip,
			select: {
				id: true,
				rating: true,
				reviewText: true,
				visible: true,
				deleted: true,
				featured: true,
				createdAt: true,
				updatedAt: true,
				organization: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				orgLocationId: true,
				orgLocation: {
					select: {
						id: true,
						name: true,
					},
				},
				orgService: {
					select: {
						id: true,
						legacyName: true,
						serviceName: {
							select: {
								key: true,
								ns: true,
								tsKey: {
									select: {
										text: true,
									},
								},
							},
						},
					},
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		}),
		prisma.orgReview.count({ where }),
	])

	return { results, total }
}

export default forReviewTable
