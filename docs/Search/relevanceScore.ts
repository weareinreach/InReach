import { Prisma } from '@weareinreach/db'

import { SEARCH_CONFIG } from './searchConfig'

/**
 * Generates the SQL relevance_score fragment based on user priorities.
 */
export const buildRelevanceSortSql = (
	priorityTags: Record<string, number> = {},
	sortBias: 'DISTANCE' | 'RELEVANCE' = 'DISTANCE'
) => {
	const priorityEntries = Object.entries(priorityTags)

	// 1. Distance Decay (Dampened Reciprocal)
	// If bias is RELEVANCE, we reduce the impact of distance
	const distanceImpact = sortBias === 'DISTANCE' ? 1.0 : 0.1
	const distanceSql = Prisma.sql`(${distanceImpact} / (1.0 + (distance / ${SEARCH_CONFIG.distanceDecayDampener})))`

	// 2. Priority Multipliers (Exponential)
	const prioritySql =
		priorityEntries.length > 0
			? Prisma.sql` + (${Prisma.join(
					priorityEntries.map(([tagId, rank]) => {
						const weight =
							SEARCH_CONFIG.priorityWeights[rank as keyof typeof SEARCH_CONFIG.priorityWeights] ?? 0
						return Prisma.sql`CASE WHEN "matchedAttributes" @> ARRAY[${tagId}]::text[] THEN ${weight} ELSE 0 END`
					}),
					' + '
				)})`
			: Prisma.empty

	// 3. Service Match Boosting (In "Match Any" mode)
	const serviceSql = Prisma.sql` + (COALESCE(cardinality("matchedServices"), 0) * ${SEARCH_CONFIG.serviceMatchWeight})`

	// 4. Verified Bonus
	const verifiedSql = Prisma.sql` + (CASE WHEN org."lastVerified" IS NOT NULL THEN ${SEARCH_CONFIG.verifiedBonus} ELSE 0 END)`

	return Prisma.sql`${distanceSql}${prioritySql}${serviceSql}${verifiedSql}`
}

/**
 * Deterministic Tie-Breakers Verified Status > Rating > Slug
 */
export const buildTieBreakerSql = () => {
	return Prisma.sql`
		CASE WHEN org."lastVerified" IS NOT NULL THEN 0 ELSE 1 END ASC,
		org."avgRating" DESC NULLS LAST,
		org.slug ASC
	`
}
