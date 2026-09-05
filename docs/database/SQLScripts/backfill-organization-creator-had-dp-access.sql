-- ONE-TIME backfill: sets Organization.creatorHadDpAccess for existing orgs, using the audit trail to
-- recover who created each one and checking their current Data Portal permissions.
--
-- Companion to
-- packages/db/prisma/migrations/20260901032210_add_organization_creator_had_dp_access/migration.sql -
-- run this manually, once, AFTER that migration has been applied.
--
-- Only touches orgs created via the public suggestion form or the Data Portal
-- (Source.source IN ('suggestion', 'data-portal')) - creatorHadDpAccess is meaningless for any other
-- source, and those rows are left untouched (NULL).
--
-- KNOWN LIMITATIONS - read before running:
-- 1. Uses the creator's CURRENT Data Portal permissions, not their permissions at the moment they
--    created the org. Permission grants/revokes aren't themselves timestamped anywhere in this schema,
--    so the org's original creation-time access can't be perfectly reconstructed - this is a
--    best-effort proxy. For an intern/volunteer whose access has since changed, this may not reflect
--    what was actually true when they submitted it.
-- 2. The audit trigger was only attached to "Organization" starting with migration
--    20230901160641_enable_audit_logging_on_tables (packages/db/prisma/migrations/...). Any org
--    created before that has no INSERT audit row at all and is left as NULL (unknown), not guessed at.
-- 3. Rows whose recovered actor resolves to the 'inreach_svc@inreach.org' service account (the audit
--    trigger's fallback identity whenever the app-level actor wasn't set for a given write - e.g.
--    anything written before getAuditedClient existed, or via a direct/raw write) are also left as
--    NULL - a match there doesn't mean "we know who actually did this."
--
-- Safe to re-run: only ever sets creatorHadDpAccess where it's currently NULL, never overwrites an
-- already-resolved value. Recommended: run once inside BEGIN ... ROLLBACK first to inspect the row
-- count and spot-check a few results before committing for real.
--
-- This is a one-time data correction, not a schema change, so it's intentionally NOT a Prisma
-- migration file - nothing here creates or alters any database object.

WITH org_creator AS (
	SELECT
		o.id AS org_id,
		(
			SELECT a."actorId"
			FROM "AuditTrail" a
			WHERE a."table" = 'Organization'
				AND a.operation = 'INSERT'
				AND a."recordId" @> ARRAY[o.id]
			ORDER BY a."timestamp" ASC
			LIMIT 1
		) AS actor_id
	FROM "Organization" o
	JOIN "Source" s ON s.id = o."sourceId"
	WHERE s.source IN ('suggestion', 'data-portal')
		AND o."creatorHadDpAccess" IS NULL
),
service_account AS (
	SELECT id FROM "User" WHERE email = 'inreach_svc@inreach.org'
),
resolved AS (
	SELECT
		oc.org_id,
		-- Mirrors packages/auth/lib/genUserSession.ts's exact permission derivation: the role-derived
		-- path (AssignedRole -> UserRole -> RolePermission -> Permission.name) unioned with the direct
		-- grant path (UserPermission -> Permission.name), no authorized/active filtering - that's what
		-- actually gates real Data Portal login access.
		EXISTS (
			SELECT 1
			FROM "AssignedRole" ar
			JOIN "RolePermission" rp ON rp."roleId" = ar."roleId"
			JOIN "Permission" p ON p.id = rp."permissionId"
			WHERE ar."userId" = oc.actor_id
				AND p.name IN ('dataPortalBasic', 'dataPortalManager', 'dataPortalAdmin', 'root', 'sysadmin', 'system')
			UNION
			SELECT 1
			FROM "UserPermission" up
			JOIN "Permission" p2 ON p2.id = up."permissionId"
			WHERE up."userId" = oc.actor_id
				AND p2.name IN ('dataPortalBasic', 'dataPortalManager', 'dataPortalAdmin', 'root', 'sysadmin', 'system')
		) AS had_dp_access
	FROM org_creator oc
	WHERE oc.actor_id IS NOT NULL
		AND oc.actor_id NOT IN (SELECT id FROM service_account)
)
UPDATE "Organization" o
SET "creatorHadDpAccess" = r.had_dp_access
FROM resolved r
WHERE o.id = r.org_id;
