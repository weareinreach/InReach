-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add indices flagged as drift
CREATE INDEX IF NOT EXISTS "AttributeSupplement_active_attributeId_idx" ON "AttributeSupplement"("active", "attributeId");
CREATE INDEX IF NOT EXISTS "OrgLocationService_active_serviceId_idx" ON "OrgLocationService"("active", "serviceId");
CREATE INDEX IF NOT EXISTS "OrgService_organizationId_published_deleted_idx" ON "OrgService"("organizationId", "published", "deleted");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgLocationId_idx" ON "ServiceArea"("active", "orgLocationId");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgServiceId_idx" ON "ServiceArea"("active", "orgServiceId");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_organizationId_idx" ON "ServiceArea"("active", "organizationId");
CREATE INDEX IF NOT EXISTS "ServiceAreaCountry_active_serviceAreaId_idx" ON "ServiceAreaCountry"("active", "serviceAreaId");
CREATE INDEX IF NOT EXISTS "ServiceAreaDist_active_serviceAreaId_idx" ON "ServiceAreaDist"("active", "serviceAreaId");

-- 3. Location Search Index (GiST)
CREATE INDEX IF NOT EXISTS "OrgLocation_geo_idx" ON "OrgLocation" USING GIST (geo);

-- 4. Clean up columns removed via db push
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrgService' AND column_name='checkMigration') THEN
        ALTER TABLE "OrgService" DROP COLUMN "checkMigration";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Organization' AND column_name='checkMigration') THEN
        ALTER TABLE "Organization" DROP COLUMN "checkMigration";
    END IF;
END $$;
