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
	id
	FROM "GeoData" g
	WHERE ST_CoveredBy((select degrees from points), g.geo)
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
),
service_area as (
	SELECT
		country."geoDataId" as "countryGeoId",
		district."geoDataId" as "districtGeoId",
		country.cca3 as "cca3",
		sa."organizationId",
		sa."orgLocationId"
	FROM "ServiceArea" sa
		 JOIN "ServiceAreaCountry" sac ON sac. "serviceAreaId" = sa.id AND sac.active
		 JOIN "ServiceAreaDist" sad ON sad. "serviceAreaId" = sa.id AND sad.active
		 JOIN "Country" country ON country.id = sac. "countryId"
		 JOIN "GovDist" district ON district.id = sad. "govDistId"
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
			ARRAY_REMOVE(ARRAY_AGG(DISTINCT sa.cca3), NULL) AS "national"
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
