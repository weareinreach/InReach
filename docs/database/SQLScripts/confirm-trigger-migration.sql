-- 1. Confirm the migration is recorded
SELECT migration_name, finished_at
FROM "_prisma_migrations"
WHERE migration_name = '20260827120000_organization_updated_at_cascade';

-- 2. Confirm all 5 functions exist
SELECT proname
FROM pg_proc
WHERE proname IN (
  'touch_organization_updated_at',
  '_touch_organizations',
  '_service_area_organization_ids',
  'organization_touch_enable',
  'organization_touch_disable'
)
ORDER BY proname;

-- 3. Confirm the trigger is attached to all 25 tables (should return exactly 25 rows)
SELECT tgrelid::regclass::text AS table_name
FROM pg_trigger
WHERE tgname = 'organization_touch_i_u_d'
ORDER BY table_name;

-- 4. Confirm the 4 newly-audited tables (should return exactly 4 rows)
SELECT tgrelid::regclass::text AS table_name
FROM pg_trigger
WHERE tgname = 'audit_i_u_d'
AND tgrelid::regclass::text IN ('"Report"', '"OrgLocationWebsite"', '"OrgLocationSocialMedia"', '"OrgServiceWebsite"');
