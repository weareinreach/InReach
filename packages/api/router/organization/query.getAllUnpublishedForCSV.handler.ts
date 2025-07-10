import { Prisma } from '@prisma/client' // Import Prisma for the SQL template tag

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAllUnpublishedForCSVSchema } from './query.getAllUnpublishedForCSV.schema'

// Define the interface for the rows returned by your view
interface OrganizationCsvExportRow {
	id: string
	'Organization Name': string
	'Organization Website'?: string
	'InReach Slug': string
	'InReach Edit URL': string
	createdAt: Date
	updatedAt: Date
	lastVerified?: Date
	published: boolean
	deleted: boolean
	countryCode?: string
	// Add any other columns present in your view here
}

const getAllUnpublishedForCSV = async ({ input }: TRPCHandlerParams<TGetAllUnpublishedForCSVSchema>) => {
	// Use $queryRaw to execute a raw SQL query against your database view
	const results = await prisma.$queryRaw<OrganizationCsvExportRow[]>(
		Prisma.sql`
      SELECT
          id,
          "Organization Name",
          "Organization Website",
          "InReach Slug",
          "InReach Edit URL",
          "createdAt",
          "updatedAt",
          "lastVerified",
          published,
          deleted,
          "countryCode"
      FROM
          organizations_csv_export_view
      WHERE
          published = FALSE AND deleted = FALSE
      ORDER BY
          "Organization Name" ASC;
    `
	)
	return results
}

export default getAllUnpublishedForCSV
