import { type z } from 'zod'

import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { TIER_CASE_SQL, UNPUBLISHED_STATUS_TIERS_WHERE } from './lib/unpublishedStatusTiers'
import {
	type TUnpublishedStatusWorklistSchema,
	type ZSortableColumn,
} from './query.unpublishedStatusWorklist.schema'

interface WorklistRow {
	id: string
	name: string
	slug: string
	deleted: boolean
	createdAt: Date
	lastVerified: Date | null
	updatedAt: Date
	tier: string
	total: bigint
}

// Whitelisted via ZSortableColumn before this ever runs - safe to map straight to a column reference.
const buildOrderBySql = (sorting: TUnpublishedStatusWorklistSchema['sorting']): Prisma.Sql => {
	const first = sorting?.[0]
	if (!first) {
		// Matches the standalone SQL report's default - oldest-touched first, safest to review first.
		return Prisma.sql`"updatedAt" ASC`
	}
	const direction = first.desc ? Prisma.sql`DESC` : Prisma.sql`ASC`
	const columns: Record<z.infer<typeof ZSortableColumn>, Prisma.Sql> = {
		name: Prisma.sql`name`,
		createdAt: Prisma.sql`"createdAt"`,
		lastVerified: Prisma.sql`"lastVerified"`,
		updatedAt: Prisma.sql`"updatedAt"`,
	}
	return Prisma.sql`${columns[first.id]} ${direction}`
}

const unpublishedStatusWorklist = async ({ input }: TRPCHandlerParams<TUnpublishedStatusWorklistSchema>) => {
	const orderBy = buildOrderBySql(input.sorting)

	const conditions: Prisma.Sql[] = []
	if (input.tier) {
		conditions.push(Prisma.sql`tier = ${input.tier}`)
	}
	if (input.search?.trim()) {
		conditions.push(Prisma.sql`name ILIKE ${`%${input.search.trim()}%`}`)
	}
	const whereClause = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty

	const rows = await prisma.$queryRaw<WorklistRow[]>(
		Prisma.sql`
			WITH tiered AS (
				SELECT
					o.id,
					o.name,
					o.slug,
					o.deleted,
					o."createdAt",
					o."lastVerified",
					o."updatedAt",
					${TIER_CASE_SQL} AS tier
				FROM "Organization" o
				WHERE ${UNPUBLISHED_STATUS_TIERS_WHERE}
			)
			SELECT *, count(*) OVER() AS total
			FROM tiered
			${whereClause}
			ORDER BY ${orderBy}
			LIMIT ${input.take}
			OFFSET ${input.skip};
		`
	)

	const results = rows.map(({ total: _total, ...row }) => row)
	return { results, total: Number(rows[0]?.total ?? 0) }
}

export default unpublishedStatusWorklist
