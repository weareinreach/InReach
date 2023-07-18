import { Prisma } from '@weareinreach/db'

import { type Context } from '../context'

export const searchOrgByDistance = async (params: Params, ctx: Context) => {
	const { lat, lon, searchRadius, skip, take, serviceFilter, attributeFilter } = params

	const results = await ctx.prisma.$queryRaw<SearchResult[]>`
WITH points AS (
	SELECT
		ST_Transform(ST_Point(${lon}, ${lat}, 4326), 3857) AS meters,
		ST_Point(${lon}, ${lat}, 4326) AS degrees
),
service_areas AS (
	SELECT
		ARRAY_AGG(DISTINCT c.id) AS country,
		ARRAY_AGG(DISTINCT gd.id) AS district
	FROM
		"Country" c
		JOIN points ON TRUE
		JOIN "GovDist" gd ON ST_CoveredBy(points.degrees, gd.geo)
	WHERE
		ST_CoveredBy(points.degrees, c.geo)
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
attributes AS (
	SELECT
		loc.id AS "locationId", ARRAY_REMOVE(ARRAY_AGG(DISTINCT la."attributeId") || ARRAY_AGG(DISTINCT oa."attributeId") || ARRAY_AGG(DISTINCT sa."attributeId"), NULL) AS "attributeIds"
	FROM
		"OrgLocation" loc
	JOIN filters ON TRUE
	LEFT JOIN "LocationAttribute" la ON la. "locationId" = loc.id
		AND la.active = TRUE
		AND la. "attributeId" = ANY(filters.attribute)
	LEFT JOIN "OrganizationAttribute" oa ON oa. "organizationId" = loc. "orgId"
		AND oa.active = TRUE
		AND oa. "attributeId" = ANY(filters.attribute)
	LEFT JOIN "OrgLocationService" ols ON ols. "orgLocationId" = loc.id
		AND ols.active = TRUE
	LEFT JOIN "ServiceAttribute" sa ON sa. "orgServiceId" = ols. "serviceId"
		AND ols.active = TRUE
		AND sa.active = TRUE
		AND sa. "attributeId" = ANY(filters.attribute)
	WHERE
		loc.published = TRUE
		AND loc.deleted = FALSE
	GROUP BY
		loc.id
	HAVING
		COUNT(DISTINCT la."attributeId") + COUNT(DISTINCT oa."attributeId") + COUNT(DISTINCT sa."attributeId") > 0
),
services AS (
	SELECT
		loc.id AS "locationId",
		ARRAY_REMOVE(ARRAY_AGG(DISTINCT ost. "tagId"), NULL) AS "tagIds"
	FROM
		"OrgLocation" loc
	CROSS JOIN filters
	LEFT JOIN "OrgLocationService" ols ON ols. "orgLocationId" = loc.id
		AND ols.active = TRUE
	JOIN "OrgService" os ON (os.id = ols. "serviceId"
			OR os. "organizationId" = loc. "orgId")
		AND os.published = TRUE
		AND os.deleted = FALSE
	JOIN "OrgServiceTag" ost ON os.id = ost. "serviceId"
		AND ost.active = TRUE
		AND ost. "tagId" = ANY (filters.service)
	WHERE
		loc.published = TRUE
		AND loc.deleted = FALSE
	GROUP BY
		loc.id
	HAVING
		COUNT(DISTINCT ost."tagId") > 0
),
locations AS (
	SELECT DISTINCT ON (loc."orgId")
		loc."orgId",
		${serviceFilter?.length ? Prisma.sql`services."tagIds",` : Prisma.empty}
		${attributeFilter?.length ? Prisma.sql` attributes."attributeIds",` : Prisma.empty}
    ROUND(ST_Distance(ST_Transform(loc.geo, 3857), points.meters)::int) AS distance,
		(SELECT sac."countryId" IS NOT NULL) as "isNational"
  FROM
    "OrgLocation" loc
  JOIN points on true
	JOIN "Organization" org ON org.id = loc."orgId"
	LEFT JOIN "ServiceArea" sa ON sa."orgLocationId" = loc.id OR sa."organizationId" = loc."orgId"
	LEFT JOIN "ServiceAreaCountry" sac ON sac."serviceAreaId" = sa.id
	LEFT JOIN "ServiceAreaDist" sad ON sad."serviceAreaId" = sa.id
	LEFT JOIN "Country" country ON country.id = sac."countryId"
	LEFT JOIN "GovDist" district ON district.id = sad."govDistId"
	${
		serviceFilter?.length
			? Prisma.sql`
	JOIN services ON services."locationId" = loc.id `
			: Prisma.empty
	}
	${
		attributeFilter?.length
			? Prisma.sql`
	JOIN attributes ON attributes."locationId" = loc.id `
			: Prisma.empty
	}
	WHERE (ST_DWithin(ST_Transform(loc.geo, 3857), points.meters, ${searchRadius})
			OR ST_Within(points.degrees, country.geo)
			OR ST_Within(points.degrees, district.geo))
		AND loc.published = TRUE
		AND loc.deleted = FALSE
		AND org.published = TRUE
		AND org.deleted = FALSE
	ORDER BY
		loc."orgId"
)
	SELECT
		*,
		COUNT(*) OVER ()::int AS total
	FROM
		locations
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
			isNational: result.isNational === 'true',
		}
	})
	return { results: formattedResults, total }
}
type SearchResult = {
	orgId: string
	tagIds?: string[]
	attributeIds?: string[]
	distance: string
	total: string
	isNational: string
}

type Params = {
	/** Latitude */
	lat: number
	/** Longitude */
	lon: number
	/** Search radius **IN METERS** */
	searchRadius: number
	/** Number of results to skip */
	skip: number
	/** Number of results to take */
	take: number
	attributeFilter?: string[]
	serviceFilter?: string[]
}
