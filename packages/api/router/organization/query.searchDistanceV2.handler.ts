import { getDistance } from 'geolib'

import { prisma, Prisma } from '@weareinreach/db'
import { buildRelevanceSortSql, buildTieBreakerSql } from '~api/router/organization/relevanceScore'
import { isPublic } from '~api/schemas/selects/common'
import { orgSearchSelect } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSearchDistanceV2Schema } from './query.searchDistanceV2.schema'

/**
 * ADVANCED SEARCH HANDLER (V2) This handler uses the Weighted Relevance Scoring engine to bubble results.
 */
const searchOrgByRelevance = async (params: TSearchDistanceV2Schema) => {
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
		service_area as (
			SELECT
			 (CASE
					WHEN sa."organizationId" IS NOT NULL THEN sa."organizationId"
					WHEN sa."orgLocationId" IS NOT NULL THEN (SELECT "orgId" FROM "OrgLocation" loc WHERE loc.id = sa."orgLocationId" )
					WHEN sa."orgServiceId" IS NOT NULL THEN COALESCE((SELECT DISTINCT loc."orgId" FROM "OrgLocationService" ols LEFT JOIN "OrgLocation" loc ON ols."orgLocationId" = loc.id WHERE ols."serviceId" = sa."orgServiceId"),
						(SELECT os."organizationId" FROM "OrgService" os WHERE os.id = sa."orgServiceId")
					)
				END
				) AS "orgId",
				ARRAY_agg(DISTINCT CASE
					WHEN country."geoDataId" IS NOT NULL THEN country."geoDataId"
					WHEN district."geoDataId" IS NOT NULL THEN district."geoDataId"
				END) AS "geoId",
				array_remove(array_agg(DISTINCT country.cca2),NULL) AS "matchedCountries"
			FROM "ServiceArea" sa
				LEFT JOIN "ServiceAreaCountry" sac ON sac. "serviceAreaId" = sa.id AND sac.active
				LEFT JOIN "ServiceAreaDist" sad ON sad. "serviceAreaId" = sa.id AND sad.active
				LEFT JOIN "Country" country ON country.id = sac. "countryId" AND country. "geoDataId" = ANY(SELECT id FROM covered_areas)
				LEFT JOIN "GovDist" district ON district.id = sad. "govDistId" AND district. "geoDataId" = ANY(SELECT id FROM covered_areas)
			WHERE sa.active
				AND (
					country. "geoDataId" = ANY(
						SELECT id
						FROM covered_areas
					)
					OR district. "geoDataId" = ANY(
						SELECT id
						FROM covered_areas
					)
				)
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
 * Copied from query.searchDistanceV1.handler.ts to ensure isolation.
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

const searchDistanceV2 = async ({ input }: TRPCHandlerParams<TSearchDistanceV2Schema>) => {
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

export default searchDistanceV2
