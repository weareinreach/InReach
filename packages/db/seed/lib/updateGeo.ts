import { prisma } from '~db/.'

/**
 * It updates the geo column of the Country, GovDist, and OrgLocation tables with the geoJSON data from the
 * geoJSON column
 *
 * @returns The number of records updated
 */
export const updateGeo = async () => {
	const country =
		await prisma.$executeRaw`UPDATE "Country" set geo = ST_SetSRID(ST_GeographyFromText("geoWKT"),4326)`

	const govDist =
		await prisma.$executeRaw`UPDATE "GovDist" set geo = ST_SetSRID(ST_GeographyFromText("geoWKT"),4326)`

	const orgLocation =
		await prisma.$executeRaw`UPDATE "OrgLocation" set geo = ST_SetSRID(ST_GeographyFromText("geoWKT"),4326)`

	return { country, govDist, orgLocation }
}
