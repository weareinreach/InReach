import { Context } from '../context'

export const searchOrgByDistance = async (params: Params, ctx: Context) => {
	const { lat, lon, searchRadius } = params
	const results = await ctx.prisma.$queryRaw<{ id: string; distMeters: string }[]>`
		SELECT * FROM (
			SELECT DISTINCT ON ("Organization".id) "Organization".id, ROUND(ST_Distance(geo, ST_SetSRID(ST_MakePoint(${lon},${lat}),4326))::numeric,0) as "distMeters" FROM "Organization" JOIN "OrgLocation" ON "OrgLocation"."orgId" = "Organization".id
		WHERE ST_DWithin("OrgLocation".geo, ST_SetSRID(ST_MakePoint(${lon},${lat}),4326), ${searchRadius})
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
