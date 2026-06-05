import { getDistance } from 'geolib'

import { prisma, Prisma } from '@weareinreach/db'
import { buildRelevanceSortSql, buildTieBreakerSql } from '~api/router/organization/relevanceScore'
import { isPublic } from '~api/schemas/selects/common'
import { orgSearchSelect } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSearchDistanceAdvSchema } from './query.searchDistanceAdv.schema'

/**
 * ADVANCED SEARCH HANDLER (V2) This handler uses the Weighted Relevance Scoring engine to bubble results.
 */
const searchOrgByRelevance = async (params: TSearchDistanceAdvSchema) => {
	const { lat, lon, dist, skip, take, services, focuses, sortBias, unit } = params

	console.log('[SearchV2] Search Parameters:', {
		coords: { lat, lon },
		activeFocuses: focuses,
		sortBias,
	})

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
		candidates AS (
			SELECT
				org.id,
				org."lastVerified",
				org."avgRating",
				org.slug,
				MIN(ROUND(ST_Distance(ST_Transform(loc.geo, 3857), (SELECT meters FROM points))::int)) AS distance,
				ARRAY_AGG(DISTINCT ost."tagId") FILTER (WHERE ost."tagId" IS NOT NULL) AS "matchedServices",
				ARRAY_AGG(DISTINCT asup."attributeId") FILTER (WHERE asup."attributeId" IS NOT NULL) AS "matchedAttributes"
			FROM "Organization" org
			INNER JOIN "OrgLocation" loc ON org.id = loc."orgId"
			LEFT JOIN "OrgService" os ON os."organizationId" = org.id AND os.published AND NOT os.deleted
			LEFT JOIN "OrgServiceTag" ost ON ost."serviceId" = os.id AND ost.active
			LEFT JOIN "AttributeSupplement" asup ON asup."organizationId" = org.id OR asup."locationId" = loc.id
			WHERE
				(
					ST_DWithin(ST_Transform(loc.geo, 3857), (SELECT meters FROM points), ${searchRadius})
					-- TODO: National/Remote ServiceArea check
				)
				AND loc.published AND org.published AND NOT loc.deleted AND NOT org.deleted
			GROUP BY org.id, org.slug, org."lastVerified", org."avgRating"
		)
		SELECT
			*,
			(${relevanceScoreSql}) as relevance_score,
			"matchedAttributes",
			"matchedServices",
			COUNT(*) OVER ()::int AS total
		FROM candidates
		WHERE
			-- Intra-group logic: OR (ANY)
			(${
				services?.length
					? Prisma.sql`"matchedServices" && ARRAY[${Prisma.join(services)}]::text[]`
					: Prisma.sql`TRUE`
			})
		ORDER BY
			relevance_score DESC,
			${tieBreakerSql}
		LIMIT ${take}
		OFFSET ${skip}
	`

	// Log the scores of the top 3 results to verify the math
	console.log(
		'[SearchV2] Top Result Scores:',
		results.slice(0, 3).map((r) => ({
			slug: r.slug,
			score: r.relevance_score,
			matched: r.matchedAttributes,
		}))
	)

	let total = 0
	const formattedResults = results.map((result) => {
		if (parseInt(result.total) !== total) {
			total = parseInt(result.total)
		}
		return {
			id: result.id,
			distMeters: parseInt(result.distance),
			relevanceScore: result.relevance_score, // Passing back to help frontend debugging
			national: [] as string[], // Placeholder for now
		}
	})
	return { results: formattedResults, total }
}

type SearchResult = {
	id: string
	distance: string
	total: string
	relevance_score: number
	slug: string
	matchedAttributes: string[]
	matchedServices: string[]
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
 * Copied from query.searchDistance.handler.ts to ensure isolation.
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

		locations.forEach(({ services: locationServices, city, ...coords }) => {
			city &&
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
		})
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

		const addressVisibility =
			locations.length === 1
				? (locations[0] as unknown as { addressVisibility: 'FULL' | 'PARTIAL' | 'HIDDEN' }).addressVisibility
				: undefined

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

const searchDistanceAdv = async ({ input }: TRPCHandlerParams<TSearchDistanceAdvSchema>) => {
	const { unit } = input

	const orgs = await searchOrgByRelevance(input)
	const resultIds = orgs.results.map(({ id }) => id)

	const results = await prismaDistSearchDetails({ ...input, resultIds })

	const orderedResults: ((typeof results)[number] & {
		distance: number
		unit: 'km' | 'mi'
		relevanceScore?: number
		national: string[]
	})[] = []

	orgs.results.forEach(({ id, distMeters, relevanceScore }) => {
		const distance = unit === 'km' ? distMeters / 1000 : distMeters / 1000 / 1.60934
		const sort = results.find((result) => result.id === id)
		if (sort) {
			orderedResults.push({ ...sort, distance: +distance.toFixed(2), unit, relevanceScore, national: [] })
		}
	})

	return { orgs: orderedResults, resultCount: orgs.total }
}

export default searchDistanceAdv
