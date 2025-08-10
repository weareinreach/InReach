import { prisma } from '@weareinreach/db'
import { attributes, freeText } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrgPageEditsSchema } from './query.forOrgPageEdits.schema'
import { formatAddressVisiblity } from '../location/lib.formatAddressVisibility'

const forOrgPageEdits = async ({ input }: TRPCHandlerParams<TForOrgPageEditsSchema>) => {
	const { slug } = input

	// We'll use Promise.all to run all database queries concurrently for better performance.
	const [org, lastUpdatedAuditResult, firstPublishedUpdateResult] = await Promise.all([
		// 1. The existing query to fetch all organization data.
		// We've added `createdAt` and `updatedAt` to the select statement.
		prisma.organization.findUniqueOrThrow({
			where: {
				slug,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				published: true,
				deleted: true,
				lastVerified: true,
				createdAt: true, // We need this for the fallback logic
				updatedAt: true, // Now also fetching the organization's own updatedAt field
				allowedEditors: { where: { authorized: true }, select: { userId: true } },
				description: freeText,
				reviews: {
					select: { id: true },
				},
				locations: {
					select: {
						id: true,
						street1: true,
						street2: true,
						city: true,
						postCode: true,
						country: { select: { cca2: true } },
						govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
						addressVisibility: true,
						latitude: true,
						longitude: true,
					},
					orderBy: [{ deleted: 'asc' }, { published: 'desc' }, { createdAt: 'desc' }],
				},
				attributes,
			},
		}),

		// 2. A raw SQL query to get the most recent audit trail timestamp for this organization.
		// This will be used for the 'last updated' date.
		prisma.$queryRaw<{ timestamp: Date }[]>`
      SELECT
        "timestamp"
      FROM
        "AuditTrail"
      WHERE
        COALESCE(
          JSONB_EXTRACT_PATH_TEXT("new", 'organizationId'),
          JSONB_EXTRACT_PATH_TEXT("new", 'orgId'),
          JSONB_EXTRACT_PATH_TEXT("new", 'organization_id')
        ) = ${slug}
      ORDER BY
        "timestamp" DESC
      LIMIT 1;
    `,

		// 3. A raw SQL query to find the first time the `published` flag was changed from false to true.
		// This will be used for the 'first published' date.
		prisma.$queryRaw<{ timestamp: Date }[]>`
      SELECT
        "timestamp"
      FROM
        "AuditTrail"
      WHERE
        "operation" = 'UPDATE'
        AND COALESCE(
          JSONB_EXTRACT_PATH_TEXT("old", 'published')
        ) = 'false'
        AND COALESCE(
          JSONB_EXTRACT_PATH_TEXT("new", 'published')
        ) = 'true'
        AND COALESCE(
          JSONB_EXTRACT_PATH_TEXT("new", 'organizationId'),
          JSONB_EXTRACT_PATH_TEXT("new", 'orgId'),
          JSONB_EXTRACT_PATH_TEXT("new", 'organization_id')
        ) = ${slug}
      ORDER BY
        "timestamp" ASC
      LIMIT 1;
    `,
	])

	const { allowedEditors, locations, ...orgData } = org

	// Use optional chaining and nullish coalescing for cleaner, safer access.
	// This will use the audit trail result if it exists, otherwise it will fall back to org.updatedAt.
	const lastUpdated = lastUpdatedAuditResult[0]?.timestamp.toISOString() ?? org.updatedAt.toISOString()

	// Same logic for firstPublished, falling back to a conditional check.
	const firstPublished =
		firstPublishedUpdateResult[0]?.timestamp.toISOString() ??
		(org.published ? org.createdAt.toISOString() : null)

	const reformatted = {
		...orgData,
		lastUpdated,
		firstPublished,
		locations: locations.map((location) => ({ ...location, ...formatAddressVisiblity(location) })),
		isClaimed: Boolean(allowedEditors.length),
	}

	return reformatted
}

export default forOrgPageEdits
