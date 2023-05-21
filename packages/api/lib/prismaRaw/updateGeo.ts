import { type LiteralUnion } from 'type-fest'

import { prisma, type PrismaClient } from '@weareinreach/db/client'

const tablesWithGeo = {
	country: 'Country',
	govDist: 'GovDist',
	orgLocation: 'OrgLocation',
} as const
type TablesWithGeo = keyof typeof tablesWithGeo
const isValidTable = (table: string): table is TablesWithGeo => Object.keys(tablesWithGeo).includes(table)

export const updateGeo: UpdateGeo = async (table, id, client) => {
	if (!isValidTable(table)) throw new Error('Invalid table name')

	const prismaClient = client ?? prisma

	switch (table) {
		case 'country': {
			return prismaClient.$executeRaw`UPDATE "Country" SET geo = ST_SetSRID(ST_GeometryFromText("geoWKT"),4326) WHERE id = ${id}`
		}
		case 'govDist': {
			return prismaClient.$executeRaw`UPDATE "GovDist" SET geo = ST_SetSRID(ST_GeometryFromText("geoWKT"),4326) WHERE id = ${id}`
		}
		case 'orgLocation': {
			return prismaClient.$executeRaw`UPDATE "OrgLocation" SET geo = ST_SetSRID(ST_GeometryFromText("geoWKT"),4326) WHERE id = ${id}`
		}
	}
}

type UpdateGeo = (
	table: LiteralUnion<TablesWithGeo, 'string'>,
	id: string,
	client?: PrismaClient | Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>
) => Promise<number>
