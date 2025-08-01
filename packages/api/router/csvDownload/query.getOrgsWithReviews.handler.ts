import { Prisma } from '@prisma/client' // Import Prisma for the SQL template tag

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetOrgsWithReviewsSchema } from './query.getOrgsWithReviews.schema'

interface OrganizationCsvExportRow {
	id: string
	'Organization Name': string
	'Organization Website'?: string | null
	'InReach Slug': string
	'InReach Edit URL': string
	'has Reviews'?: string | null
	createdAt: Date
	updatedAt: Date | null
	lastVerified?: Date | null
	published: boolean
	deleted: boolean
	countryCode?: string | null
}

const getOrgsWithReviews = async (_params: TRPCHandlerParams<TGetOrgsWithReviewsSchema>) => {
	const results = await prisma.$queryRaw<OrganizationCsvExportRow[]>(
		Prisma.sql`SELECT * FROM organizations_with_review;`
	)
	return results
}

export default getOrgsWithReviews
