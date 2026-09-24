import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForReviewTableSchema, type TReviewStatusFilter } from './query.forReviewTable.schema'

// See ZReviewStatusFilter's comment - 'deleted' is checked as its own bucket regardless of `visible` so a
// hidden-and-deleted review still matches "Deleted," same as the Status column's own badges (which can
// show both at once).
const REVIEW_STATUS_WHERE: Record<TReviewStatusFilter, Prisma.OrgReviewWhereInput> = {
	active: { visible: true, deleted: false },
	hidden: { visible: false, deleted: false },
	deleted: { deleted: true },
}

// Built as top-level `AND` conditions (each its own object) rather than assigning multiple keys directly
// on `where` - `status` and `search` each need their own `OR`, and a plain JS object can only hold one
// `OR` key, so a second assignment would silently clobber the first (see user/query.forUserTable.handler.ts
// for the same pattern/reasoning).
const buildWhere = (input: TForReviewTableSchema): Prisma.OrgReviewWhereInput => {
	const and: Prisma.OrgReviewWhereInput[] = []
	if (input.visible !== undefined) {
		and.push({ visible: input.visible })
	}
	if (input.deleted !== undefined) {
		and.push({ deleted: input.deleted })
	}
	if (input.status?.length) {
		and.push({ OR: input.status.map((status) => REVIEW_STATUS_WHERE[status]) })
	}
	if (input.rating?.length) {
		and.push({ rating: { in: input.rating } })
	}
	if (input.createdByUserIds?.length) {
		and.push({ userId: { in: input.createdByUserIds } })
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
				{ reviewText: { contains: input.search, mode: 'insensitive' } },
				{ user: { name: { contains: input.search, mode: 'insensitive' } } },
				{ user: { email: { contains: input.search, mode: 'insensitive' } } },
				{ organization: { name: { contains: input.search, mode: 'insensitive' } } },
				{ orgLocation: { name: { contains: input.search, mode: 'insensitive' } } },
			],
		})
	}
	return and.length ? { AND: and } : {}
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
