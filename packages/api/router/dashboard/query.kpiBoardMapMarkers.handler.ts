import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { KPI_DATA_QUALITY_STATUS_CASE_SQL, kpiDataQualityStatusWhere } from './lib/kpiDataQualityStatus'
import { type TKpiBoardMapMarkersSchema } from './query.kpiBoardMapMarkers.schema'

interface MarkerRow {
	orgId: string
	locationId: string
	slug: string
	name: string
	latitude: number
	longitude: number
	status: 'good' | 'needs_review' | 'critical'
}

// Hard cap, not paginated - the point is "everything matching the current filter," not a page of
// it. See docs/Dashboards/KpiBoard/README.md's Map tab section.
const MAX_MARKERS = 5000

/**
 * One row per (org, location) with coordinates - a physical-presence map, not a per-service breakdown.
 * category/attribute filters narrow which orgs show, but a marker doesn't carry "the" category since a single
 * org can offer services across many.
 */
const kpiBoardMapMarkers = async ({ input }: TRPCHandlerParams<TKpiBoardMapMarkersSchema>) => {
	const conditions: Prisma.Sql[] = [
		Prisma.sql`o.deleted = false`,
		Prisma.sql`ol.deleted = false AND ol.published = true`,
		Prisma.sql`ol.latitude IS NOT NULL AND ol.longitude IS NOT NULL`,
	]

	const search = input.search?.trim()
	if (search) {
		conditions.push(Prisma.sql`o.name ILIKE ${`%${search}%`}`)
	}
	if (input.serviceTagIds?.length) {
		conditions.push(Prisma.sql`EXISTS (
			SELECT 1 FROM "OrgServiceTag" ost
			JOIN "OrgService" os ON os.id = ost."serviceId"
			WHERE os."organizationId" = o.id AND ost.active = true AND ost."tagId" = ANY(${input.serviceTagIds})
		)`)
	}
	if (input.attributeIds?.length) {
		conditions.push(Prisma.sql`EXISTS (
			SELECT 1 FROM "AttributeSupplement" asup
			WHERE asup.active = true AND asup."attributeId" = ANY(${input.attributeIds})
				AND (
					asup."organizationId" = o.id
					OR asup."serviceId" IN (SELECT id FROM "OrgService" WHERE "organizationId" = o.id)
				)
		)`)
	}
	if (input.status) {
		conditions.push(kpiDataQualityStatusWhere(input.status))
	}

	const rows = await prisma.$queryRaw<MarkerRow[]>(Prisma.sql`
		SELECT
			o.id AS "orgId",
			ol.id AS "locationId",
			o.slug AS "slug",
			o.name AS "name",
			ol.latitude AS "latitude",
			ol.longitude AS "longitude",
			${KPI_DATA_QUALITY_STATUS_CASE_SQL} AS "status"
		FROM "Organization" o
		JOIN "OrgLocation" ol ON ol."orgId" = o.id
		WHERE ${Prisma.join(conditions, ' AND ')}
		LIMIT ${MAX_MARKERS}
	`)

	return rows
}

export default kpiBoardMapMarkers
