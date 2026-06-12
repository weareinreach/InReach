-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Alter Table to add materialized columns
ALTER TABLE "Organization"
ADD COLUMN IF NOT EXISTS "attributeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "serviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Create Trigram Helper Function
-- This allows the unaccent function to be used in an IMMUTABLE way for indexing
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
  RETURNS text AS
$func$
SELECT public.unaccent('public.unaccent', $1)
$func$  LANGUAGE sql IMMUTABLE;

-- 4. Create Indices

-- Materialized Column Indexes (GIN)
CREATE INDEX IF NOT EXISTS "Organization_attributeIds_idx" ON "Organization" USING GIN ("attributeIds");
CREATE INDEX IF NOT EXISTS "Organization_serviceIds_idx" ON "Organization" USING GIN ("serviceIds");

-- Smart Name Search Index (Trigram GIN)
-- Matches normalization logic: lowercase, unaccented, alphanumeric only
CREATE INDEX IF NOT EXISTS "Organization_name_trgm_gin_idx" ON "Organization"
USING GIN (lower(public.immutable_unaccent(regexp_replace(name, '[^a-zA-Z0-9 ]', '', 'g'))) gin_trgm_ops);

-- Geographic Index (GiST)
CREATE INDEX IF NOT EXISTS "OrgLocation_geo_idx" ON "OrgLocation" USING GIST (geo);

-- Performance and Drift Indices
CREATE INDEX IF NOT EXISTS "AttributeSupplement_active_attributeId_idx" ON "AttributeSupplement"("active", "attributeId");
CREATE INDEX IF NOT EXISTS "OrgLocationService_active_serviceId_idx" ON "OrgLocationService"("active", "serviceId");
CREATE INDEX IF NOT EXISTS "OrgService_organizationId_published_deleted_idx" ON "OrgService"("organizationId", "published", "deleted");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgLocationId_idx" ON "ServiceArea"("active", "orgLocationId");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgServiceId_idx" ON "ServiceArea"("active", "orgServiceId");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_organizationId_idx" ON "ServiceArea"("active", "organizationId");
CREATE INDEX IF NOT EXISTS "ServiceAreaCountry_active_serviceAreaId_idx" ON "ServiceAreaCountry"("active", "serviceAreaId");
CREATE INDEX IF NOT EXISTS "ServiceAreaDist_active_serviceAreaId_idx" ON "ServiceAreaDist"("active", "serviceAreaId");

-- 5. Clean up legacy columns from sync drift
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrgService' AND column_name='checkMigration') THEN
        ALTER TABLE "OrgService" DROP COLUMN "checkMigration";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Organization' AND column_name='checkMigration') THEN
        ALTER TABLE "Organization" DROP COLUMN "checkMigration";
    END IF;
END $$;

-- 6. Trigger Functions to maintain materialized columns

-- Sync Attribute IDs
CREATE OR REPLACE FUNCTION sync_org_attribute_ids() RETURNS TRIGGER AS $$
DECLARE
  v_org_id TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_org_id := COALESCE(
      OLD."organizationId",
      (SELECT "orgId" FROM "OrgLocation" WHERE id = OLD."locationId"),
      (SELECT "organizationId" FROM "OrgService" WHERE id = OLD."serviceId")
    );
  ELSE
    v_org_id := COALESCE(
      NEW."organizationId",
      (SELECT "orgId" FROM "OrgLocation" WHERE id = NEW."locationId"),
      (SELECT "organizationId" FROM "OrgService" WHERE id = NEW."serviceId")
    );
  END IF;

  IF v_org_id IS NOT NULL THEN
    UPDATE "Organization"
    SET "attributeIds" = ARRAY(
      SELECT DISTINCT asup."attributeId"
      FROM "AttributeSupplement" asup
      LEFT JOIN "OrgLocation" loc ON asup."locationId" = loc.id
      LEFT JOIN "OrgService" os ON asup."serviceId" = os.id
      WHERE (asup."organizationId" = v_org_id OR loc."orgId" = v_org_id OR os."organizationId" = v_org_id)
        AND asup.active = true
    ) WHERE id = v_org_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Sync Service IDs
CREATE OR REPLACE FUNCTION sync_org_service_ids() RETURNS TRIGGER AS $$
DECLARE
  v_org_id TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    SELECT "organizationId" INTO v_org_id FROM "OrgService" WHERE id = OLD."serviceId";
  ELSE
    SELECT "organizationId" INTO v_org_id FROM "OrgService" WHERE id = NEW."serviceId";
  END IF;

  IF v_org_id IS NOT NULL THEN
    UPDATE "Organization" SET "serviceIds" = ARRAY(
      SELECT DISTINCT ost."tagId"
      FROM "OrgServiceTag" ost
      JOIN "OrgService" os ON ost."serviceId" = os.id
      WHERE os."organizationId" = v_org_id AND ost.active = true
    ) WHERE id = v_org_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Apply Triggers
DROP TRIGGER IF EXISTS trg_sync_org_attribute_ids ON "AttributeSupplement";
CREATE TRIGGER trg_sync_org_attribute_ids AFTER INSERT OR UPDATE OR DELETE ON "AttributeSupplement" FOR EACH ROW EXECUTE FUNCTION sync_org_attribute_ids();

DROP TRIGGER IF EXISTS trg_sync_org_service_ids ON "OrgServiceTag";
CREATE TRIGGER trg_sync_org_service_ids AFTER INSERT OR UPDATE OR DELETE ON "OrgServiceTag" FOR EACH ROW EXECUTE FUNCTION sync_org_service_ids();
