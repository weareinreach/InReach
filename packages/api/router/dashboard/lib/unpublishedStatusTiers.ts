import { Prisma } from '@prisma/client'

/**
 * Groups unpublished, not-yet-tagged (`unpublishedReason IS NULL`) orgs by what's actually knowable about
 * them - context for a human reviewer's judgment, not an inferred answer. Mirrors
 * docs/Database/SQLScripts/report-unpublished-status-backfill-tiers.sql exactly; kept in sync manually since
 * that script is meant to be run standalone (outside the app) for ad hoc review. See
 * docs/Dashboards/UnpublishedStatus/README.md for why this can't be a real automated backfill.
 *
 * The 30-day "still legitimately new" window is a judgment call, not a measured value - change it here and in
 * the SQL script together if it needs adjusting.
 */
export const TIER_CASE_SQL = Prisma.sql`
	CASE
		WHEN o."lastVerified" IS NULL AND o.deleted = false AND o."createdAt" >= now() - interval '30 days'
			THEN '1a - Never verified, not deleted, created <30d ago'
		WHEN o."lastVerified" IS NULL AND o.deleted = false
			THEN '1b - Never verified, not deleted, created 30d+ ago'
		WHEN o."lastVerified" IS NULL AND o.deleted = true THEN '2 - Never verified, deleted'
		WHEN o."lastVerified" IS NOT NULL AND o.deleted = true THEN '3 - Previously verified, deleted'
		ELSE '4 - Previously verified, still unpublished, never deleted'
	END
`

export const UNPUBLISHED_STATUS_TIERS_WHERE = Prisma.sql`o.published = false AND o."unpublishedReason" IS NULL`
