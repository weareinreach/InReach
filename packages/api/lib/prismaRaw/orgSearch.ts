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
		ARRAY_AGG(DISTINCT c .id) AS country,
		ARRAY_AGG(DISTINCT gd.id) AS district
	FROM "Country" c
		JOIN points ON TRUE
		JOIN "GovDist" gd ON ST_CoveredBy(points.degrees, gd.geo)
	WHERE ST_CoveredBy(points.degrees, c .geo)
),
attributes AS (
SELECT * FROM (
	SELECT
		la. "locationId" AS "id",
		la. "attributeId"
	FROM "LocationAttribute" la
	JOIN filters on true
	WHERE la.active AND la."attributeId" = ANY(filters.attribute)
	UNION ALL
	SELECT
		l.id,
		oa. "attributeId"
	FROM "OrganizationAttribute" oa
		JOIN filters on true
		INNER JOIN "OrgLocation" l ON l. "orgId" = oa. "organizationId" AND l.published AND NOT l.deleted
	WHERE oa.active AND oa."attributeId" = ANY(filters.attribute)
	UNION ALL
	SELECT ols. "orgLocationId" AS "id",
		sa. "attributeId"
	FROM "OrgLocationService" ols
		JOIN filters on true
		INNER JOIN "ServiceAttribute" sa ON ols. "serviceId" = sa. "orgServiceId" AND sa.active AND sa."attributeId" = ANY(filters.attribute)
	WHERE  ols.active
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
					ST_Distance(ST_Transform(loc.geo, 3857), points.meters)::int
				)
			) AS distance,
			ARRAY_REMOVE(ARRAY_AGG(DISTINCT country.cca3), NULL) AS "national"
		FROM "OrgLocation" loc
			JOIN points ON TRUE
			JOIN filters ON TRUE
			JOIN covered_areas ca ON TRUE
			INNER JOIN "Organization" org ON org.id = loc. "orgId"
			AND org.published
			AND NOT org.deleted
			LEFT JOIN "ServiceArea" sa ON sa. "orgLocationId" = loc.id
			OR sa. "organizationId" = loc. "orgId"
			LEFT JOIN "ServiceAreaCountry" sac ON sac. "serviceAreaId" = sa.id
			LEFT JOIN "ServiceAreaDist" sad ON sad. "serviceAreaId" = sa.id
			LEFT JOIN "Country" country ON country.id = sac. "countryId"
			LEFT JOIN "GovDist" district ON district.id = sad. "govDistId"
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
			ST_DWithin(ST_Transform(loc.geo, 3857), points.meters, ${searchRadius})
			OR country.id = ANY (ca.country)
			OR district.id = ANY (ca.district)
		)
		AND loc.published = TRUE
		AND loc.deleted = FALSE
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
	total: string
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
