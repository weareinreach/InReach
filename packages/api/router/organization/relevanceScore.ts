import { Prisma } from '@weareinreach/db'

import { SEARCH_CONFIG } from './searchConfig'

export const buildRelevanceSortSql = (
	params: { focuses?: string[] },
	sortBias: 'DISTANCE' | 'RELEVANCE' = 'DISTANCE'
) => {
	const { focuses = [] } = params

	// 1. Distance Decay
	const distanceImpact = sortBias === 'DISTANCE' ? 1.0 : 0.1
	const distanceSql = Prisma.sql`(${distanceImpact} / (1.0 + (distance / ${SEARCH_CONFIG.distanceDecayDampener})))`

	// 2. Priority Multipliers (The list is now pre-filtered and ordered by the frontend)
	const prioritySql =
		focuses.length > 0
			? Prisma.sql` + (${Prisma.join(
					focuses.map((tagId, index) => {
						const rank = index + 1
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const weight = (SEARCH_CONFIG.priorityWeights as any)[rank] ?? 0
						return Prisma.sql`CASE WHEN "matchedAttributes" @> ARRAY[${tagId}]::text[] THEN ${weight} ELSE 0 END`
					}),
					' + '
				)})`
			: Prisma.empty

	const serviceSql = Prisma.sql` + (COALESCE(cardinality("matchedServices"), 0) * ${SEARCH_CONFIG.serviceMatchWeight})`
	const verifiedSql = Prisma.sql` + (CASE WHEN org."lastVerified" IS NOT NULL THEN ${SEARCH_CONFIG.verifiedBonus} ELSE 0 END)`

	return Prisma.sql`${distanceSql}${prioritySql}${serviceSql}${verifiedSql}`
}

export const buildTieBreakerSql = () => {
	return Prisma.sql`
		CASE WHEN org."lastVerified" IS NOT NULL THEN 0 ELSE 1 END ASC,
		org."avgRating" DESC NULLS LAST,
		org.slug ASC
	`
}
