import { getDistance } from 'geolib'

import { prisma, Prisma } from '@weareinreach/db'
import { isPublic } from '~api/schemas/selects/common'
import { orgSearchSelect } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSearchDistanceSchema } from './query.searchDistance.schema'

const searchOrgByDistance = async (params: TSearchDistanceSchema) => {
	const { lat, lon, dist, skip, take, services: serviceFilter, attributes: attributeFilter, unit } = params

	const searchRadius = unit === 'km' ? dist * 1000 : Math.round(dist * 1.60934 * 1000)

	const results = await prisma.$queryRaw<SearchResult[]>`
WITH points AS (
	SELECT
		ST_Transform(ST_Point(${lon}, ${lat}, 4326), 3857) AS meters,
		ST_Point(${lon}, ${lat}, 4326) AS degrees
),
filters(
	attribute, service
) AS (
	VALUES (ARRAY[${
		attributeFilter?.length ? Prisma.sql`${Prisma.join(attributeFilter, ',')}` : Prisma.empty
	}]::text[], ARRAY[${
		serviceFilter?.length ? Prisma.sql`${Prisma.join(serviceFilter, ',')}` : Prisma.empty
	}]::text[])
),
covered_areas AS (
	SELECT
	id
	FROM "GeoData" g
	WHERE ST_CoveredBy((select degrees from points), g.geo)
),
attributes AS (
SELECT * FROM (
	SELECT
		attr. "locationId" AS "id",
		attr. "attributeId"
	FROM "AttributeSupplement" attr
	JOIN filters on true
	WHERE attr.active AND attr."attributeId" = ANY(filters.attribute)
) at
	GROUP BY id, "attributeId"
	ORDER BY id, "attributeId"
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
		country."geoDataId" as "countryGeoId",
		district."geoDataId" as "districtGeoId",
		district.slug AS "districtSlug",
		country.cca3 as "cca3",
		sa."organizationId",
		sa."orgLocationId"
	FROM "ServiceArea" sa
		 LEFT JOIN "ServiceAreaCountry" sac ON sac. "serviceAreaId" = sa.id AND sac.active
		 LEFT JOIN "ServiceAreaDist" sad ON sad. "serviceAreaId" = sa.id AND sad.active
		 LEFT JOIN "Country" country ON country.id = sac. "countryId"
		 LEFT JOIN "GovDist" district ON district.id = sad. "govDistId"
	WHERE sa.active AND sa."organizationId" is not null
)
	SELECT
		*,
		COUNT(*) OVER ()::int AS total
	FROM (
		SELECT
			loc. "orgId",
			${
				serviceFilter?.length
					? Prisma.sql`ARRAY_REMOVE(ARRAY_AGG(DISTINCT services. "tagId"), NULL) AS "matchedServices",`
					: Prisma.empty
			}
			${
				attributeFilter?.length
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
			ARRAY_REMOVE(ARRAY_AGG(DISTINCT sa.cca3), NULL) AS "national",
			ARRAY_LENGTH(ARRAY_REMOVE(ARRAY_AGG(DISTINCT sa.cca3), NULL),1) is not NULL AS "isNational",
			ARRAY_REMOVE(ARRAY_AGG(DISTINCT sa.cca3) || ARRAY_AGG( DISTINCT sa."districtSlug"), NULL) AS "serviceAreas"
		FROM "OrgLocation" loc
			INNER JOIN "Organization" org ON org.id = loc. "orgId"
			LEFT JOIN service_area sa ON  sa. "organizationId" = loc. "orgId"
			${
				serviceFilter?.length
					? Prisma.sql`
		INNER JOIN services ON services."organizationId" = loc."orgId"`
					: Prisma.empty
			}
		${
			attributeFilter?.length
				? Prisma.sql`
		INNER JOIN attributes ON attributes.id = loc.id`
				: Prisma.empty
		}
	WHERE
		(
			ST_DWithin(ST_Transform(loc.geo, 3857), (SELECT meters FROM points), ${searchRadius})
			OR sa."countryGeoId"  = ANY(SELECT id FROM covered_areas)
			OR sa."districtGeoId" = ANY(SELECT id FROM covered_areas)
		)
		AND loc.published
		AND org.published
		AND NOT loc.deleted
		AND NOT org.deleted
	GROUP BY
		loc."orgId"
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
			id: result.orgId,
			distMeters: parseInt(result.distance),
			national: result.national,
		}
	})
	return { results: formattedResults, total }
}
type SearchResult = {
	orgId: string
	matchedServices?: string[]
	matchedAttributes?: string[]
	distance: string
	national: string[]
	isNational: boolean
	serviceAreas: string[]
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
export default searchDistance
