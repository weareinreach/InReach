import { Context } from '../context'

export const searchOrgByDistance = async (params: Params, ctx: Context) => {
	const { lat, lon, searchRadius } = params
	const results = await ctx.prisma.$queryRaw<{ id: string; distMeters: string }[]>`
		SELECT *
		FROM (
			SELECT
				DISTINCT ON ("Organization".id) "Organization".id,
				ROUND(
					ST_Distance(
						ST_Transform(
							loc.geo, 3857
						),
						ST_Transform(
							ST_SetSRID(
								ST_MakePoint(${lon},${lat}),
								4326
							), 3857
						)
					)::NUMERIC, 0
				)
				AS "distMeters"
			FROM "Organization"
			JOIN "OrgLocation" loc
				ON loc."orgId" = "Organization".id
			WHERE ST_Distance(
				ST_Transform(
					loc.geo, 3857
				),
				ST_Transform(
					ST_SetSRID(ST_MakePoint(${lon},${lat}),4326), 3857
				)
			) <= ${searchRadius}
		) org
		ORDER BY "distMeters" ASC`
	const formattedResults = results.map((result) => ({
		id: result.id,
		distMeters: parseInt(result.distMeters),
	}))
	return formattedResults
}
type Params = {
	/** Latitude */
	lat: number
	/** Longitude */
	lon: number
	/** Search radius **IN METERS** */
	searchRadius: number
}
