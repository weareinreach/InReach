/**
 * DRAFT PROTOTYPE: SearchDistanceV2 Handler This file demonstrates the integration of the weighted scoring
 * logic. Once finalized, this will move to packages/api/router/organization/
 */
import { prisma, Prisma } from '@weareinreach/db'

import { type TSearchDistanceSchemaV2 } from './query.searchDistanceV2.schema'
import { buildRelevanceSortSql, buildTieBreakerSql } from './relevanceScore'

export const searchDistanceV2Handler = async ({ input }: { input: TSearchDistanceSchemaV2 }) => {
	const {
		lat,
		lon,
		dist,
		take,
		skip,
		unit,
		priorityTags,
		sortBias,
		matchMode,
		includeNational: _includeNational,
		services,
	} = input

	// 1. Calculate Radius in Meters
	const searchRadius = unit === 'km' ? dist * 1000 : Math.round(dist * 1.60934 * 1000)

	// 2. Generate the Dynamic Scoring SQL
	const relevanceScoreSql = buildRelevanceSortSql(priorityTags, sortBias)
	const tieBreakerSql = buildTieBreakerSql()

	// 3. The V2 Query
	// Note: Uses LEFT JOIN for OR mode to ensure we don't hide results
	const results = await prisma.$queryRaw`
		WITH points AS (
			SELECT
				ST_Transform(ST_Point(${lon}, ${lat}, 4326), 3857) AS meters,
				ST_Point(${lon}, ${lat}, 4326) AS degrees
		),
		candidates AS (
			SELECT
				org.id,
				org.slug,
				org."lastVerified",
				org."avgRating",
				MIN(ROUND(ST_Distance(ST_Transform(loc.geo, 3857), (SELECT meters FROM points))::int)) AS distance,
				-- Collect services/attributes for the scoring engine
				ARRAY_AGG(DISTINCT ost."tagId") AS "matchedServices",
				ARRAY_AGG(DISTINCT asup."attributeId") AS "matchedAttributes"
			FROM "Organization" org
			INNER JOIN "OrgLocation" loc ON org.id = loc."orgId"
			LEFT JOIN "OrgServiceTag" ost ON ost."serviceId" IN (SELECT id FROM "OrgService" WHERE "organizationId" = org.id)
			LEFT JOIN "AttributeSupplement" asup ON asup."organizationId" = org.id OR asup."locationId" = loc.id
			WHERE
				(
					ST_DWithin(ST_Transform(loc.geo, 3857), (SELECT meters FROM points), ${searchRadius})
					-- TODO: Add ServiceArea logic for includeNational here
				)
				AND org.published AND NOT org.deleted
			GROUP BY org.id, org.slug, org."lastVerified", org."avgRating"
		)
		SELECT
			*,
			(${relevanceScoreSql}) as relevance_score,
			COUNT(*) OVER ()::int AS total
		FROM candidates
		WHERE
			-- Performance Safeguard: If filters are present, must match at least one in OR mode
			-- Or match ALL in AND mode (handled via subquery or array logic)
			(${
				matchMode === 'OR' && services?.length
					? Prisma.sql`"matchedServices" && ARRAY[${Prisma.join(services)}]::text[]`
					: Prisma.sql`TRUE`
			})
		ORDER BY
			relevance_score DESC,
			${tieBreakerSql}
		LIMIT ${take}
		OFFSET ${skip}
	`

	return results
}
