-- ONE-TIME backfill: sets Organization.updatedAt to the most recent timestamp found anywhere in
-- its hierarchy (itself + every table the organization_touch_i_u_d trigger now covers), to catch
-- up data that predates the trigger going live.
--
-- Companion to the trigger added in
-- packages/db/prisma/migrations/20260827120000_organization_updated_at_cascade/migration.sql -
-- run this manually, once, AFTER that migration has been applied.
--
-- Safe to re-run: it only ever moves updatedAt FORWARD (only updates where the computed max is
-- strictly greater than what's already stored), and no-ops entirely for an org where nothing
-- resolves to anything newer.
--
-- This is a one-time data correction, not a schema change, so it's intentionally NOT a Prisma
-- migration file - nothing here creates or alters any database object.
--
-- Validated (2026-08-27) against a full copy of the dev database, wrapped in BEGIN/ROLLBACK so
-- nothing was actually committed: ran with no errors, updated 2,641 of 3,663 organizations.

WITH sources AS (
	SELECT id AS "organizationId", "updatedAt" AS ts FROM "Organization"
	UNION ALL
	SELECT "orgId", "updatedAt" FROM "OrgLocation"
	UNION ALL
	SELECT "organizationId", "updatedAt" FROM "OrgService" WHERE "organizationId" IS NOT NULL
	UNION ALL
	SELECT "organizationId", "linkedAt" FROM "OrganizationPhone"
	UNION ALL
	SELECT "organizationId", "linkedAt" FROM "OrganizationEmail"
	UNION ALL
	SELECT "organizationId", "updatedAt" FROM "OrgReview"
	UNION ALL
	SELECT "organizationId", "updatedAt" FROM "Report"
	UNION ALL
	SELECT COALESCE(h."organizationId", ol."orgId", os."organizationId"), h."updatedAt"
	FROM "OrgHours" h
	LEFT JOIN "OrgLocation" ol ON ol.id = h."orgLocId"
	LEFT JOIN "OrgService" os ON os.id = h."orgServiceId"
	UNION ALL
	SELECT COALESCE(a."organizationId", ol."orgId", os."organizationId"), a."updatedAt"
	FROM "AttributeSupplement" a
	LEFT JOIN "OrgLocation" ol ON ol.id = a."locationId"
	LEFT JOIN "OrgService" os ON os.id = a."serviceId"
	UNION ALL
	SELECT COALESCE(sa."organizationId", ol."orgId", os."organizationId"), sa."updatedAt"
	FROM "ServiceArea" sa
	LEFT JOIN "OrgLocation" ol ON ol.id = sa."orgLocationId"
	LEFT JOIN "OrgService" os ON os.id = sa."orgServiceId"
	UNION ALL
	SELECT COALESCE(p."orgId", ol."orgId"), p."updatedAt"
	FROM "OrgPhoto" p
	LEFT JOIN "OrgLocation" ol ON ol.id = p."orgLocationId"
	UNION ALL
	SELECT op."organizationId", ph."updatedAt" FROM "OrgPhone" ph JOIN "OrganizationPhone" op ON op."phoneId" = ph.id
	UNION ALL
	SELECT ol."orgId", ph."updatedAt" FROM "OrgPhone" ph JOIN "OrgLocationPhone" olp ON olp."phoneId" = ph.id JOIN "OrgLocation" ol ON ol.id = olp."orgLocationId"
	UNION ALL
	SELECT os."organizationId", ph."updatedAt" FROM "OrgPhone" ph JOIN "OrgServicePhone" osp ON osp."orgPhoneId" = ph.id JOIN "OrgService" os ON os.id = osp."serviceId"
	UNION ALL
	SELECT oe."organizationId", em."updatedAt" FROM "OrgEmail" em JOIN "OrganizationEmail" oe ON oe."orgEmailId" = em.id
	UNION ALL
	SELECT ol."orgId", em."updatedAt" FROM "OrgEmail" em JOIN "OrgLocationEmail" ole ON ole."orgEmailId" = em.id JOIN "OrgLocation" ol ON ol.id = ole."orgLocationId"
	UNION ALL
	SELECT os."organizationId", em."updatedAt" FROM "OrgEmail" em JOIN "OrgServiceEmail" ose ON ose."orgEmailId" = em.id JOIN "OrgService" os ON os.id = ose."serviceId"
	UNION ALL
	SELECT w."organizationId", w."updatedAt" FROM "OrgWebsite" w WHERE w."organizationId" IS NOT NULL
	UNION ALL
	SELECT ol."orgId", w."updatedAt" FROM "OrgWebsite" w JOIN "OrgLocationWebsite" olw ON olw."orgWebsiteId" = w.id JOIN "OrgLocation" ol ON ol.id = olw."orgLocationId"
	UNION ALL
	SELECT os."organizationId", w."updatedAt" FROM "OrgWebsite" w JOIN "OrgServiceWebsite" osw ON osw."orgWebsiteId" = w.id JOIN "OrgService" os ON os.id = osw."serviceId"
	UNION ALL
	SELECT sm."organizationId", sm."updatedAt" FROM "OrgSocialMedia" sm WHERE sm."organizationId" IS NOT NULL
	UNION ALL
	SELECT ol."orgId", sm."updatedAt" FROM "OrgSocialMedia" sm JOIN "OrgLocationSocialMedia" olsm ON olsm."socialMediaId" = sm.id JOIN "OrgLocation" ol ON ol.id = olsm."orgLocationId"
	UNION ALL
	SELECT ol."orgId", jt."linkedAt" FROM "OrgLocationEmail" jt JOIN "OrgLocation" ol ON ol.id = jt."orgLocationId"
	UNION ALL
	SELECT ol."orgId", jt."linkedAt" FROM "OrgLocationPhone" jt JOIN "OrgLocation" ol ON ol.id = jt."orgLocationId"
	UNION ALL
	SELECT ol."orgId", jt."linkedAt" FROM "OrgLocationService" jt JOIN "OrgLocation" ol ON ol.id = jt."orgLocationId"
	UNION ALL
	SELECT ol."orgId", jt."linkedAt" FROM "OrgLocationWebsite" jt JOIN "OrgLocation" ol ON ol.id = jt."orgLocationId"
	UNION ALL
	SELECT ol."orgId", jt."linkedAt" FROM "OrgLocationSocialMedia" jt JOIN "OrgLocation" ol ON ol.id = jt."orgLocationId"
	UNION ALL
	SELECT os."organizationId", jt."linkedAt" FROM "OrgServiceEmail" jt JOIN "OrgService" os ON os.id = jt."serviceId" WHERE os."organizationId" IS NOT NULL
	UNION ALL
	SELECT os."organizationId", jt."linkedAt" FROM "OrgServicePhone" jt JOIN "OrgService" os ON os.id = jt."serviceId" WHERE os."organizationId" IS NOT NULL
	UNION ALL
	SELECT os."organizationId", jt."linkedAt" FROM "OrgServiceWebsite" jt JOIN "OrgService" os ON os.id = jt."serviceId" WHERE os."organizationId" IS NOT NULL
	UNION ALL
	SELECT os."organizationId", jt."linkedAt" FROM "OrgServiceTag" jt JOIN "OrgService" os ON os.id = jt."serviceId" WHERE os."organizationId" IS NOT NULL
	UNION ALL
	SELECT COALESCE(sa."organizationId", ol."orgId", os."organizationId"), sac."linkedAt"
	FROM "ServiceAreaCountry" sac
	JOIN "ServiceArea" sa ON sa.id = sac."serviceAreaId"
	LEFT JOIN "OrgLocation" ol ON ol.id = sa."orgLocationId"
	LEFT JOIN "OrgService" os ON os.id = sa."orgServiceId"
	UNION ALL
	SELECT COALESCE(sa."organizationId", ol."orgId", os."organizationId"), sad."linkedAt"
	FROM "ServiceAreaDist" sad
	JOIN "ServiceArea" sa ON sa.id = sad."serviceAreaId"
	LEFT JOIN "OrgLocation" ol ON ol.id = sa."orgLocationId"
	LEFT JOIN "OrgService" os ON os.id = sa."orgServiceId"
),
max_per_org AS (
	SELECT "organizationId", MAX(ts) AS max_ts
	FROM sources
	WHERE "organizationId" IS NOT NULL
	GROUP BY "organizationId"
)
UPDATE "Organization" o
SET "updatedAt" = m.max_ts
FROM max_per_org m
WHERE o.id = m."organizationId"
AND m.max_ts > o."updatedAt";
