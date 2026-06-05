import { Prisma } from '@weareinreach/db'

import { SEARCH_CONFIG } from './searchConfig'

export const buildRelevanceSortSql = (
	params: { focuses?: string[] },
	sortBias: 'DISTANCE' | 'RELEVANCE' = 'DISTANCE'
) => {
	const { focuses: _focuses = [] } = params

	// Phase 1: Distance-only scoring to ensure parity with standard search.
	// Nuanced multipliers (verified bonus, service match, community focus) are currently disabled.

	// 1. Distance Decay (Score approaches 1.0 as distance approaches 0)
	const distanceSql = Prisma.sql`COALESCE((1.0 / (1.0 + (distance / ${SEARCH_CONFIG.distanceDecayDampener}))), 0)`

	// 2. Priority Multipliers (Community Focus) - Disabled for Phase 1
	const prioritySql = Prisma.empty

	// 3. Service Match and Verified Bonus - Disabled for Phase 1
	const serviceSql = Prisma.empty
	const verifiedSql = Prisma.empty

	return Prisma.sql`COALESCE((${distanceSql}${prioritySql}${serviceSql}${verifiedSql}), 0)`
}

export const buildTieBreakerSql = () => {
	return Prisma.sql`
		"slug" ASC
	`
}
