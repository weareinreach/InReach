import { getDistance } from 'geolib'

import { prisma, Prisma } from '@weareinreach/db'
import { isPublic } from '~api/schemas/selects/common'
import { orgSearchSelect } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSearchDistanceSchema } from './query.searchDistance.schema'

const searchOrgByDistance = async (params: TSearchDistanceSchema) => {
	const { lat, lon, dist, skip, take, services: serviceFilter, attributes: attribsToFilter, unit } = params

	const attributeFilter: AttributeFilters = {
		include: [],
		exclude: [],
	}
	if (!!attribsToFilter && attribsToFilter.length) {
		const attributeDefs = await prisma.attribute.findMany({
			select: {
				id: true,
				filterType: true,
			},
		})
		for (const attrib of attribsToFilter) {
			const def = attributeDefs.find((d) => d.id === attrib)
			if (def) {
				if (def.filterType === 'EXCLUDE') {
					attributeFilter.exclude.push(attrib)
				} else {
					attributeFilter.include.push(attrib)
				}
			}
		}
	}

	const hasAttribFilter = !!attributeFilter.include.length || !!attributeFilter.exclude.length
	const hasServiceFilter = !!serviceFilter?.length

	const searchRadius = unit === 'km' ? dist * 1000 : Math.round(dist * 1.60934 * 1000)

	const results = await prisma.$queryRaw<SearchResult[]>`
WITH points AS (
	SELECT
		ST_Transform(ST_Point(${lon}, ${lat}, 4326), 3857) AS meters,
		ST_Point(${lon}, ${lat}, 4326) AS degrees
),
filters(
	attribute_inc,attribute_exc, service
) AS (
	VALUES (
		ARRAY[${
			attributeFilter.include.length ? Prisma.sql`${Prisma.join(attributeFilter.include, ',')}` : Prisma.empty
		}]::text[],
		ARRAY[${
			attributeFilter.exclude.length ? Prisma.sql`${Prisma.join(attributeFilter.exclude, ',')}` : Prisma.empty
		}]::text[],
		ARRAY[${serviceFilter?.length ? Prisma.sql`${Prisma.join(serviceFilter, ',')}` : Prisma.empty}]::text[]
	)
),
covered_areas AS (
	SELECT
	id
	FROM "GeoData" g
	WHERE ST_CoveredBy((select degrees from points), g.geo)
),
attributes AS (
	SELECT *
	FROM (
			SELECT attr. "locationId" AS "locId",
				attr."organizationId" as "orgId",
				attr. "attributeId"
			FROM "AttributeSupplement" attr
				JOIN filters on true

			WHERE attr.active
				AND ${
					!!attributeFilter.include.length && !!attributeFilter.exclude.length
						? Prisma.sql`(attr. "attributeId" = ANY(filters.attribute_inc)
				OR NOT attr. "attributeId" = ANY(filters.attribute_exc))`
						: attributeFilter.exclude.length
							? Prisma.sql`NOT attr. "attributeId" = ANY(filters.attribute_exc)`
							: Prisma.sql`attr. "attributeId" = ANY(filters.attribute_inc)`
				}
		) at
	GROUP BY "locId",
		"orgId",
		"attributeId"
	ORDER BY "locId",
		"orgId",
		"attributeId"
),
services AS (
	SELECT ost. "tagId",
		ols. "orgLocationId",
		os. "organizationId"
	FROM "OrgServiceTag" ost
		JOIN filters ON TRUE
		INNER JOIN "OrgService" os ON ost. "serviceId" = os.id AND  os.published AND NOT os.deleted
		INNER JOIN "OrgLocationService" ols ON ols. "serviceId" = os.id AND ols.active
	WHERE ost.active AND ost."tagId" = ANY(filters.service)
	GROUP BY ost. "tagId",
		ols. "orgLocationId",
		os. "organizationId"
	ORDER BY os."organizationId", ols."orgLocationId"
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
		array_remove(array_agg(DISTINCT district.slug), NULL) AS "matchedDistricts",
		array_remove(array_agg(DISTINCT country.cca2),NULL) AS "matchedCountries"
	FROM "ServiceArea" sa
		LEFT JOIN "ServiceAreaCountry" sac ON sac. "serviceAreaId" = sa.id
		AND sac.active
		LEFT JOIN "ServiceAreaDist" sad ON sad. "serviceAreaId" = sa.id
		AND sad.active
		LEFT JOIN "Country" country ON country.id = sac. "countryId" AND country. "geoDataId" = ANY(
				SELECT id
				FROM covered_areas
			)
		LEFT JOIN "GovDist" district ON district.id = sad. "govDistId" AND district. "geoDataId" = ANY(
				SELECT id
				FROM covered_areas
			)
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
)
	SELECT
		*,
		COUNT(*) OVER ()::int AS total
	FROM (
		SELECT
			org.id,
			${
				hasServiceFilter
					? Prisma.sql`ARRAY_REMOVE(ARRAY_AGG(DISTINCT services. "tagId"), NULL) AS "matchedServices",`
					: Prisma.empty
			}
			${
				hasAttribFilter
					? Prisma.sql`ARRAY_REMOVE(
				ARRAY_AGG(DISTINCT attributes. "attributeId"),
				NULL
			) AS "matchedAttributes",`
					: Prisma.empty
			}
			MIN(
				ROUND(
					ST_Distance(ST_Transform(loc.geo, 3857), (SELECT meters FROM points))::int
				)
			) AS distance,
			sa."matchedCountries" AS "national"
		FROM "Organization" org
			INNER JOIN "OrgLocation" loc ON org.id = loc. "orgId"
			LEFT JOIN service_area sa ON sa. "orgId" = org.id
			${
				hasServiceFilter
					? Prisma.sql`
		INNER JOIN services ON services."organizationId" = org.id`
					: Prisma.empty
			}
		${
			hasAttribFilter
				? Prisma.sql`
		INNER JOIN attributes ON attributes."locId" = loc.id OR attributes."orgId" = org.id`
				: Prisma.empty
		}
	WHERE
		(
			ST_DWithin(ST_Transform(loc.geo, 3857), (SELECT meters FROM points), ${searchRadius})
			OR sa."geoId" && ARRAY(SELECT id FROM covered_areas)
		)
		AND loc.published
		AND org.published
		AND NOT loc.deleted
		AND NOT org.deleted
	GROUP BY
		org.id, sa."matchedCountries"
	ORDER BY
		distance
	) result
ORDER BY
	distance
LIMIT ${take}
OFFSET ${skip}`

	let total = 0
	const formattedResults = results.map((result) => {
		if (parseInt(result.total) !== total) total = parseInt(result.total)
		return {
			id: result.id,
			distMeters: parseInt(result.distance),
			national: result.national ?? [],
		}
	})
	return { results: formattedResults, total }
}
type SearchResult = {
	id: string
	matchedServices?: string[]
	matchedAttributes?: string[]
	distance: string
	national: string[] | null
	// isNational: boolean
	// serviceAreas: string[]
	total: string
}
const prismaDistSearchDetails = async (input: TSearchDistanceSchema & { resultIds: string[] }) => {
	const { resultIds, lat: latitude, lon: longitude } = input
	const results = await prisma.organization.findMany({
		where: {
			id: { in: resultIds },
			...isPublic,
		},
		select: orgSearchSelect,
	})

	const transformed = results.map(({ attributes, description, locations, services, ...rest }) => {
		const servIds = new Set<string>()
		const attribIds = new Set<string>()
		const cities: City[] = []
		const serviceTagMap = new Map<string, IdKeyNs>()
		const serviceCategoryMap = new Map<string, IdKeyNs>()
		const attributeMap = new Map<string, Attribute>()

		services.forEach(({ services }) =>
			services.forEach(({ tag, service }) => {
				const { id, tsKey, tsNs, primaryCategory } = tag
				servIds.add(id)
				serviceCategoryMap.set(primaryCategory.id, primaryCategory)
				serviceTagMap.set(id, { id, tsKey, tsNs })
				service.attributes.forEach(({ attribute }) => {
					const { categories, ...rest } = attribute
					attribIds.add(rest.id)
					categories.forEach(({ category }) =>
						attributeMap.set(`${rest.id}${category.tag}`, { category, ...rest })
					)
				})
			})
		)

		locations.forEach(({ services, city, ...coords }) => {
			cities.push({
				city,
				dist: getDistance(
					{ latitude, longitude },
					{ latitude: coords.latitude ?? 0, longitude: coords.longitude ?? 0 },
					1000
				),
			})
			services.forEach(({ service }) =>
				service.services.forEach(({ tag, service }) => {
					const { id, tsKey, tsNs, primaryCategory } = tag
					servIds.add(id)
					serviceCategoryMap.set(primaryCategory.id, primaryCategory)
					serviceTagMap.set(id, { id, tsKey, tsNs })
					service.attributes.forEach(({ attribute }) => {
						const { categories, ...rest } = attribute
						attribIds.add(rest.id)
						categories.forEach(({ category }) =>
							attributeMap.set(`${rest.id}${category.tag}`, { category, ...rest })
						)
					})
				})
			)
		})
		attributes.forEach(({ attribute }) => {
			const { categories, ...rest } = attribute
			attribIds.add(rest.id)
			categories.forEach(({ category }) =>
				attributeMap.set(`${rest.id}${category.tag}`, { category, ...rest })
			)
		})

		const desc = description
			? { key: description.key, ns: description.ns, text: description.tsKey.text }
			: null

		// const serviceTags = Array.from(serviceTagMap.values())
		const serviceCategories = Array.from(serviceCategoryMap.values())
		const allAttributes = Array.from(attributeMap.values())

		const orgLeader = allAttributes.filter(({ category }) => category.tag === 'organization-leadership')
		const orgFocus = allAttributes.filter(
			({ category, _count: count }) => category.tag === 'service-focus' && count.parents === 0
		)
		const sortedCities = [
			...new Set(cities.sort(({ dist: distA }, { dist: distB }) => distA - distB).map(({ city }) => city)),
		]

		return {
			...rest,
			description: desc,
			serviceCategories,
			orgLeader,
			orgFocus,
			locations: sortedCities,
		}
	})

	return transformed
}

export type PrismaDistSearchDetailsResult = Prisma.PromiseReturnType<typeof prismaDistSearchDetails>

type IdKeyNs = {
	id: string
	tsKey: string
	tsNs: string
}
type Attribute = {
	id: string
	tsKey: string
	icon: string | null
	iconBg: string | null
	category: {
		tag: string
	}
	_count: {
		parents: number
	}
}
type City = {
	city: string
	dist: number
}

export const searchDistance = async ({ input }: TRPCHandlerParams<TSearchDistanceSchema>) => {
	const { unit } = input

	const orgs = await searchOrgByDistance(input)
	const resultIds = orgs.results.map(({ id }) => id)

	const results = await prismaDistSearchDetails({ ...input, resultIds })

	const orderedResults: ((typeof results)[number] & {
		distance: number
		unit: 'km' | 'mi'
		national: string[]
	})[] = []
	orgs.results.forEach(({ id, distMeters, national }) => {
		const distance = unit === 'km' ? distMeters / 1000 : distMeters / 1000 / 1.60934
		const sort = results.find((result) => result.id === id)
		if (sort) orderedResults.push({ ...sort, distance: +distance.toFixed(2), unit, national })
	})
	return { orgs: orderedResults, resultCount: orgs.total }
}

type AttributeFilters = {
	include: string[]
	exclude: string[]
}
export default searchDistance
