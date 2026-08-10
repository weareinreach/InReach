import { getDistance } from 'geolib'

import { prisma, Prisma } from '@weareinreach/db'
import { buildRelevanceSortSql, buildTieBreakerSql } from '~api/router/organization/relevanceScore'
import { isPublic } from '~api/schemas/selects/common'
import { orgSearchSelect } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSearchDistanceV3Schema } from './query.searchDistanceV3.schema'

/**
 * SEARCH HANDLER (V3) - identical matching/ranking semantics to query.searchDistanceV2.handler.ts (v2),
 * except for how the `service_area` CTE resolves each `ServiceArea` row to the org id it applies to. v2 does
 * this via a single CASE expression with a correlated subquery in each of its orgLocationId/orgServiceId
 * branches; v3 does it via three independent, plain-filtered branches (org-level, location-level,
 * service-level) unioned together.
 *
 * Why: Postgres's planner has no statistics for the _output_ of a CASE expression, and can't discount a
 * branch's subquery cost based on how often that branch is actually taken - so it prices v2's CASE as if
 * every row might hit every branch's subquery (confirmed via EXPLAIN ANALYZE: that CTE's cost estimate was
 * ~8000x its actual runtime), which pushes the whole query over Postgres's JIT-compilation threshold for no
 * real benefit. Each branch below is filtered by a plain `IS NOT NULL` check on an actual column and resolves
 * its org id via a normal JOIN instead of a scalar subquery, which the planner can size up accurately. Each
 * branch also excludes the higher-priority column(s) explicitly (e.g. the orgLocationId branch requires
 * organizationId IS NULL) so this stays equivalent to v2's CASE's WHEN...THEN priority order even if a row
 * somehow had more than one of these three FKs populated. Verified against v2 across real search locations
 * covering all three ServiceArea linkage types (org/location/service-level) - identical results and ordering,
 * 4x-12x faster.
 */
const searchOrgByRelevance = async (params: TSearchDistanceV3Schema) => {
	const { lat, lon, dist, skip, take, services, attributes, focuses, sortBias, unit } = params

	const searchRadius = unit === 'km' ? dist * 1000 : Math.round(dist * 1.60934 * 1000)

	// Generate the SQL fragments for the scoring engine
	const relevanceScoreSql = buildRelevanceSortSql({ focuses }, sortBias)
	const tieBreakerSql = buildTieBreakerSql()

	const results = await prisma.$queryRaw<SearchResult[]>`
		WITH points AS (
			SELECT
				ST_Transform(ST_Point(${lon}, ${lat}, 4326), 3857) AS meters,
				ST_Point(${lon}, ${lat}, 4326) AS degrees
		),
		covered_areas AS (
			SELECT id FROM "GeoData" g WHERE ST_CoveredBy((select degrees from points), g.geo)
		),
		service_area_by_org AS (
			SELECT
				sa."organizationId" AS "orgId",
				country."geoDataId" AS "countryGeoId",
				district."geoDataId" AS "districtGeoId",
				country.cca2
			FROM "ServiceArea" sa
				LEFT JOIN "ServiceAreaCountry" sac ON sac."serviceAreaId" = sa.id AND sac.active
				LEFT JOIN "ServiceAreaDist" sad ON sad."serviceAreaId" = sa.id AND sad.active
				LEFT JOIN "Country" country ON country.id = sac."countryId" AND country."geoDataId" = ANY(SELECT id FROM covered_areas)
				LEFT JOIN "GovDist" district ON district.id = sad."govDistId" AND district."geoDataId" = ANY(SELECT id FROM covered_areas)
			WHERE sa.active
				AND sa."organizationId" IS NOT NULL
				AND (
					country."geoDataId" = ANY(SELECT id FROM covered_areas)
					OR district."geoDataId" = ANY(SELECT id FROM covered_areas)
				)
		),
		service_area_by_location AS (
			SELECT
				loc."orgId" AS "orgId",
				country."geoDataId" AS "countryGeoId",
				district."geoDataId" AS "districtGeoId",
				country.cca2
			FROM "ServiceArea" sa
				JOIN "OrgLocation" loc ON loc.id = sa."orgLocationId"
				LEFT JOIN "ServiceAreaCountry" sac ON sac."serviceAreaId" = sa.id AND sac.active
				LEFT JOIN "ServiceAreaDist" sad ON sad."serviceAreaId" = sa.id AND sad.active
				LEFT JOIN "Country" country ON country.id = sac."countryId" AND country."geoDataId" = ANY(SELECT id FROM covered_areas)
				LEFT JOIN "GovDist" district ON district.id = sad."govDistId" AND district."geoDataId" = ANY(SELECT id FROM covered_areas)
			WHERE sa.active
				AND sa."organizationId" IS NULL
				AND sa."orgLocationId" IS NOT NULL
				AND (
					country."geoDataId" = ANY(SELECT id FROM covered_areas)
					OR district."geoDataId" = ANY(SELECT id FROM covered_areas)
				)
		),
		service_area_by_service AS (
			SELECT
				COALESCE(loc2."orgId", os."organizationId") AS "orgId",
				country."geoDataId" AS "countryGeoId",
				district."geoDataId" AS "districtGeoId",
				country.cca2
			FROM "ServiceArea" sa
				LEFT JOIN "OrgLocationService" ols ON ols."serviceId" = sa."orgServiceId"
				LEFT JOIN "OrgLocation" loc2 ON loc2.id = ols."orgLocationId"
				LEFT JOIN "OrgService" os ON os.id = sa."orgServiceId"
				LEFT JOIN "ServiceAreaCountry" sac ON sac."serviceAreaId" = sa.id AND sac.active
				LEFT JOIN "ServiceAreaDist" sad ON sad."serviceAreaId" = sa.id AND sad.active
				LEFT JOIN "Country" country ON country.id = sac."countryId" AND country."geoDataId" = ANY(SELECT id FROM covered_areas)
				LEFT JOIN "GovDist" district ON district.id = sad."govDistId" AND district."geoDataId" = ANY(SELECT id FROM covered_areas)
			WHERE sa.active
				AND sa."organizationId" IS NULL
				AND sa."orgLocationId" IS NULL
				AND sa."orgServiceId" IS NOT NULL
				AND (
					country."geoDataId" = ANY(SELECT id FROM covered_areas)
					OR district."geoDataId" = ANY(SELECT id FROM covered_areas)
				)
		),
		service_area_raw AS (
			SELECT * FROM service_area_by_org
			UNION ALL
			SELECT * FROM service_area_by_location
			UNION ALL
			SELECT * FROM service_area_by_service
		),
		service_area AS (
			SELECT
				"orgId",
				ARRAY_agg(DISTINCT CASE
					WHEN "countryGeoId" IS NOT NULL THEN "countryGeoId"
					WHEN "districtGeoId" IS NOT NULL THEN "districtGeoId"
				END) AS "geoId",
				array_remove(array_agg(DISTINCT cca2), NULL) AS "matchedCountries"
			FROM service_area_raw
			GROUP BY "orgId"
		),
		candidates AS (
			SELECT
				org.id,
				org."lastVerified",
				org.slug,
				MIN(ROUND(ST_Distance(ST_Transform(loc.geo, 3857), (SELECT meters FROM points))::int)) AS distance,
				org."serviceIds" AS "matchedServices",
				org."attributeIds" AS "matchedAttributes",
				sa."matchedCountries" AS "national"
			FROM "Organization" org
			INNER JOIN "OrgLocation" loc ON org.id = loc."orgId"
			LEFT JOIN service_area sa ON sa."orgId" = org.id
			WHERE
				(
					ST_DWithin(ST_Transform(loc.geo, 3857), (SELECT meters FROM points), ${searchRadius})
					OR sa."geoId" && ARRAY(SELECT id FROM covered_areas)
					-- TODO: National/Remote ServiceArea check
				)
				AND loc."published" AND org."published" AND NOT loc."deleted" AND NOT org."deleted"
			GROUP BY org.id, org.slug, org."lastVerified", sa."matchedCountries", org."serviceIds", org."attributeIds"
		)
		SELECT
			*,
			CASE
				WHEN distance <= 16093 THEN 'NEIGHBORHOOD'
				WHEN distance <= 40234 THEN 'LOCAL'
				WHEN distance <= 80467 THEN 'REGION'
				WHEN distance <= ${searchRadius} THEN 'EXTENDED_REGION'
				ELSE 'NATIONAL'
			END AS "tier",
			(distance <= ${searchRadius}) AS "isLocal",
			(${relevanceScoreSql}) as relevance_score,
			"matchedAttributes",
			"matchedServices",
			COUNT(*) OVER ()::int AS total
		FROM candidates
		WHERE
			-- Services Filter: OR logic (ANY)
			(${
				services?.length
					? Prisma.sql`"matchedServices" && ARRAY[${Prisma.join(services)}]::text[]`
					: Prisma.sql`TRUE`
			})
			-- Attributes Filter: Parity with V1 INNER JOIN logic (Matches ANY selected attribute)
			AND (${
				attributes?.length
					? Prisma.sql`"matchedAttributes" && ARRAY[${Prisma.join(attributes)}]::text[]`
					: Prisma.sql`TRUE`
			})
		ORDER BY
			CASE
				WHEN distance <= 16093 THEN 1
				WHEN distance <= 40234 THEN 2
				WHEN distance <= 80467 THEN 3
				WHEN distance <= ${searchRadius} THEN 4
				ELSE 5
			END ASC,
			relevance_score DESC,
			${tieBreakerSql}
		LIMIT ${take}
		OFFSET ${skip}
	`

	let total = 0
	const formattedResults = results.map((result) => {
		if (parseInt(result.total) !== total) {
			total = parseInt(result.total)
		}
		return {
			id: result.id,
			distMeters: result.distance ? parseInt(result.distance) : null,
			relevanceScore: result.relevance_score, // Passing back to help frontend debugging
			isLocal: result.isLocal,
			tier: result.tier,
			national: result.national ?? [],
		}
	})
	return { results: formattedResults, total }
}

type SearchResult = {
	id: string
	distance: string | null
	isLocal: boolean
	tier: string
	total: string
	relevance_score: number
	slug: string
	matchedAttributes: string[]
	matchedServices: string[]
	national: string[] | null
}

type IdKeyNs = {
	id: string
	tsKey: string
	tsNs: string
}

type CategoryWithId = IdKeyNs & { id: string }

interface AttributeWithCategory {
	category: { tag: string }
	id: string
	tsKey: string
	tsNs?: string
	icon?: string | null
	iconBg?: string | null
	_count: { parents: number }
}

/**
 * Copied from query.searchDistanceV2.handler.ts to ensure isolation.
 */
const prismaDistSearchDetails = async (input: { resultIds: string[]; lat: number; lon: number }) => {
	const { resultIds, lat: latitude, lon: longitude } = input
	const results = await prisma.organization.findMany({
		where: {
			id: { in: resultIds },
			...isPublic,
		},
		select: orgSearchSelect,
	})

	const transformed = results.map(({ attributes, description, locations, services, ...rest }) => {
		const cities: { city: string; dist: number }[] = []
		const serviceCategoryMap = new Map<string, CategoryWithId>()
		const attributeMap = new Map<string, AttributeWithCategory>()

		services.forEach(({ services: innerServices }) =>
			innerServices.forEach(({ tag, service }) => {
				const { primaryCategory } = tag
				serviceCategoryMap.set(primaryCategory.id, primaryCategory)
				service.attributes.forEach(({ attribute }) => {
					const { categories, ...attrib } = attribute
					categories.forEach(({ category }) =>
						attributeMap.set(`${attrib.id}${category.tag}`, { category, ...attrib })
					)
				})
			})
		)

		locations.forEach(
			({ services: locationServices, city, addressVisibility: locationVisibility, ...coords }) => {
				city &&
					locationVisibility !== 'HIDDEN' &&
					cities.push({
						city,
						dist: getDistance(
							{ latitude, longitude },
							{ latitude: coords.latitude ?? 0, longitude: coords.longitude ?? 0 },
							1000
						),
					})
				locationServices.forEach(({ service }) =>
					service.services.forEach(({ tag, service: innerService }) => {
						const { primaryCategory } = tag
						serviceCategoryMap.set(primaryCategory.id, primaryCategory)
						innerService.attributes.forEach(({ attribute }) => {
							const { categories, ...attrib } = attribute
							categories.forEach(({ category }) =>
								attributeMap.set(`${attrib.id}${category.tag}`, { category, ...attrib })
							)
						})
					})
				)
			}
		)
		attributes.forEach(({ attribute }) => {
			const { categories, ...attrib } = attribute
			categories.forEach(({ category }) =>
				attributeMap.set(`${attrib.id}${category.tag}`, { category, ...attrib })
			)
		})

		const desc = description
			? { key: description.key, ns: description.ns, text: description.tsKey.text }
			: null

		const serviceCategories = Array.from(serviceCategoryMap.values())
		const allAttributes = Array.from(attributeMap.values())

		const orgLeader = allAttributes.filter(({ category }) => category.tag === 'organization-leadership')
		const orgFocus = allAttributes.filter(
			({ category, _count: count }) => category.tag === 'service-focus' && count.parents === 0
		)
		const sortedCities = [
			...new Set(
				cities.toSorted(({ dist: distA }, { dist: distB }) => distA - distB).map(({ city }) => city)
			),
		]

		const addressVisibility = locations.length === 1 ? locations[0]?.addressVisibility : undefined

		return {
			...rest,
			description: desc,
			serviceCategories,
			orgLeader,
			orgFocus,
			locations: sortedCities,
			addressVisibility,
		}
	})

	return transformed
}

const searchDistanceV3 = async ({ input }: TRPCHandlerParams<TSearchDistanceV3Schema>) => {
	const { unit } = input

	const orgs = await searchOrgByRelevance(input)
	const resultIds = orgs.results.map(({ id }) => id)

	const results = await prismaDistSearchDetails({ ...input, resultIds })

	const orderedResults: ((typeof results)[number] & {
		distance: number | null
		unit: 'km' | 'mi'
		relevanceScore?: number
		isLocal: boolean
		tier: string
		national: string[]
	})[] = []

	orgs.results.forEach(({ id, distMeters, relevanceScore, isLocal, tier, national }) => {
		const distance = distMeters ? (unit === 'km' ? distMeters / 1000 : distMeters / 1000 / 1.60934) : null
		const sort = results.find((result) => result.id === id)
		if (sort) {
			orderedResults.push({
				...sort,
				distance: distance ? +distance.toFixed(2) : null,
				unit,
				relevanceScore,
				isLocal,
				tier,
				national,
			})
		}
	})

	return { orgs: orderedResults, resultCount: orgs.total }
}

export default searchDistanceV3
