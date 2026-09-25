import { Prisma } from '@prisma/client'

/**
 * First-draft data-quality status rule (Good / Needs Review / Critical) for the KPI Board - v1 draft,
 * thresholds are explicit judgment calls (loosely modeled on Unpublished Status's own 30-day cutoff, see
 * ./unpublishedStatusTiers.ts), not measured. Meant to be presented as adjustable, not treated as final.
 * Shared by Overview's counts, Explore's report/drilldown, and Map's markers so all three never disagree -
 * see docs/Dashboards/KpiBoard/README.md for the full rationale.
 *
 * Only requires the calling query to alias Organization as `o` - the phone/website check is a self-contained
 * EXISTS subquery, so this doesn't impose any join requirements on the caller.
 */
export const KPI_DATA_QUALITY_STATUS_CASE_SQL = Prisma.sql`
	CASE
		WHEN o.deleted = true THEN 'critical'
		WHEN o.published = false AND o."unpublishedReason" IS NULL THEN 'critical'
		WHEN o."lastVerified" IS NULL AND o."createdAt" < now() - interval '90 days' THEN 'critical'
		WHEN o."lastVerified" IS NOT NULL AND o."lastVerified" < now() - interval '365 days' THEN 'critical'
		WHEN o.published = false AND o."unpublishedReason" IS NOT NULL THEN 'needs_review'
		WHEN o."lastVerified" IS NOT NULL AND o."lastVerified" < now() - interval '180 days' THEN 'needs_review'
		WHEN NOT EXISTS (
			SELECT 1 FROM "OrganizationPhone" op WHERE op."organizationId" = o.id AND op.active = true
		) AND NOT EXISTS (
			SELECT 1 FROM "OrgLocation" ol
			JOIN "OrgLocationPhone" olp ON olp."orgLocationId" = ol.id AND olp.active = true
			WHERE ol."orgId" = o.id AND ol.deleted = false
		) AND NOT EXISTS (
			SELECT 1 FROM "OrgLocation" ol
			JOIN "OrgLocationWebsite" olw ON olw."orgLocationId" = ol.id AND olw.active = true
			WHERE ol."orgId" = o.id AND ol.deleted = false
		) THEN 'needs_review'
		ELSE 'good'
	END
`

export type KpiDataQualityStatus = 'good' | 'needs_review' | 'critical'

/**
 * Filter helper - `WHERE ${kpiDataQualityStatusWhere('critical')}` against a query aliasing Organization as
 * `o`.
 */
export const kpiDataQualityStatusWhere = (status: KpiDataQualityStatus) =>
	Prisma.sql`(${KPI_DATA_QUALITY_STATUS_CASE_SQL}) = ${status}`
