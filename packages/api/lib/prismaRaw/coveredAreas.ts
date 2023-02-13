import { Context } from '../context'

export const getCoveredDists = async (coords: Coords, ctx: Context) => {
	const { lat, lon } = coords

	const result = await ctx.prisma.$queryRaw<{ id: string }[]>`
	SELECT id FROM "GovDist"
	WHERE ST_CoveredBy(ST_SetSRID(ST_MakePoint(${lon}, ${lat}),4326), geo)
	`
	return result
}
export const getCoveredCountry = async (coords: Coords, ctx: Context) => {
	const { lat, lon } = coords

	const result = await ctx.prisma.$queryRaw<{ id: string }>`
	SELECT id FROM "Country"
	WHERE ST_CoveredBy(ST_SetSRID(ST_MakePoint(${lon}, ${lat}),4326), geo)
	`
	return result
}
export const getCoveredAreas = async (coords: Coords, ctx: Context) => {
	const { lat, lon } = coords

	const result = await ctx.prisma.$transaction(async (tx) => {
		const govDist = await tx.$queryRaw<{ id: string }[]>`
	SELECT id FROM "GovDist"
	WHERE ST_CoveredBy(ST_SetSRID(ST_MakePoint(${lon}, ${lat}),4326), geo)
	`
		const country = await tx.$queryRaw<{ id: string }[]>`
	SELECT id FROM "Country"
	WHERE ST_CoveredBy(ST_SetSRID(ST_MakePoint(${lon}, ${lat}),4326), geo)
	`
		return {
			country,
			govDist,
		}
	})
	return result
}

type Coords = {
	lat: number
	lon: number
}
