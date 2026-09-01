import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { TIER_CASE_SQL, UNPUBLISHED_STATUS_TIERS_WHERE } from './lib/unpublishedStatusTiers'
import { type TUnpublishedStatusSummarySchema } from './query.unpublishedStatusSummary.schema'

interface TierCountRow {
	tier: string
	count: bigint
}

const unpublishedStatusSummary = async (_params: TRPCHandlerParams<TUnpublishedStatusSummarySchema>) => {
	const rows = await prisma.$queryRaw<TierCountRow[]>(
		Prisma.sql`
			SELECT ${TIER_CASE_SQL} AS tier, count(*) AS count
			FROM "Organization" o
			WHERE ${UNPUBLISHED_STATUS_TIERS_WHERE}
			GROUP BY 1
			ORDER BY 1;
		`
	)
	return rows.map((row) => ({ tier: row.tier, count: Number(row.count) }))
}

export default unpublishedStatusSummary
