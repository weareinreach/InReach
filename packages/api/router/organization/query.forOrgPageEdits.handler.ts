import { prisma } from '@weareinreach/db'
import { freeText } from '~api/schemas/selects/common'
import { attributesForOrgEdit } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrgPageEditsSchema } from './query.forOrgPageEdits.schema'
import { formatAddressVisiblity } from '../location/lib.formatAddressVisibility'

const forOrgPageEdits = async ({ input }: TRPCHandlerParams<TForOrgPageEditsSchema>) => {
	const { slug } = input

	const org = await prisma.organization.findUniqueOrThrow({
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
			attributes: attributesForOrgEdit,
		},
	})

	// Both queries key off the org's real id against the already-indexed `recordId`
	// column (GIN index) instead of parsing every row's JSON payload, so this stays a
	// fast, scoped lookup no matter how large the shared AuditTrail table grows.
	const [lastUpdatedAuditResult, firstPublishedUpdateResult] = await Promise.all([
		// The most recent change to this Organization's own row -- used for 'last updated'.
		prisma.$queryRaw<{ timestamp: Date }[]>`
      SELECT
        "timestamp"
      FROM
        "AuditTrail"
      WHERE
        "table" = 'Organization'
        AND "recordId" @> ARRAY[${org.id}]::text[]
      ORDER BY
        "timestamp" DESC
      LIMIT 1;
    `,

		// The first time `published` flipped from false to true -- used for 'first published'.
		prisma.$queryRaw<{ timestamp: Date }[]>`
      SELECT
        "timestamp"
      FROM
        "AuditTrail"
      WHERE
        "table" = 'Organization'
        AND "recordId" @> ARRAY[${org.id}]::text[]
        AND "operation" = 'UPDATE'
        AND ("old"->>'published') = 'false'
        AND ("new"->>'published') = 'true'
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
