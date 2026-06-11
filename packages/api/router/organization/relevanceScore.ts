import { Prisma } from '@weareinreach/db'

import { SEARCH_CONFIG } from './searchConfig'

export const buildRelevanceSortSql = (
	params: { focuses?: string[] },
	// it's ok to have this unused var for now as it will be used in the future
	_sortBias: 'DISTANCE' | 'RELEVANCE' = 'DISTANCE'
) => {
	const { focuses = [] } = params

	// 1. Distance Decay (Scale 0 to 1)
	// If distance is NULL (National), it contributes 0 to the relevance score.
	const distanceSql = Prisma.sql`CASE WHEN distance IS NULL THEN 0 ELSE (1.0 / (1.0 + (distance::float / 1000.0))) END`

	// 2. Priority Multipliers (Community Focus)
	// Restores bubbling for focuses selected/ordered in the sidebar.
	const prioritySql =
		focuses.length > 0
			? Prisma.sql` + (${Prisma.join(
					focuses.map((tagId, index) => {
						const rank = index + 1
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const weight = (SEARCH_CONFIG.priorityWeights as any)[rank] ?? 0
						return Prisma.sql`COALESCE(CASE WHEN "matchedAttributes" @> ARRAY[${tagId}]::text[] THEN ${weight} ELSE 0 END, 0)`
					}),
					' + '
				)})`
			: Prisma.empty

	// 3. Service Density & Verification Bonuses - Disabled for Phase 2
	const serviceSql = Prisma.empty
	const verifiedSql = Prisma.empty

	return Prisma.sql`COALESCE((${distanceSql}${prioritySql}${serviceSql}${verifiedSql}), 0)`
}

export const buildTieBreakerSql = () => {
	return Prisma.sql`
		"slug" ASC
	`
}
