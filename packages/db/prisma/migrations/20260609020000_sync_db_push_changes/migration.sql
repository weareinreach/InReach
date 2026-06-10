-- 1. Create SearchSynonym table
CREATE TABLE IF NOT EXISTS "SearchSynonym" (
    "id" TEXT NOT NULL,
    "terms" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchSynonym_pkey" PRIMARY KEY ("id")
);

-- 2. Add indices flagged as drift
CREATE INDEX IF NOT EXISTS "AttributeSupplement_active_attributeId_idx" ON "AttributeSupplement"("active", "attributeId");
CREATE INDEX IF NOT EXISTS "OrgLocationService_active_serviceId_idx" ON "OrgLocationService"("active", "serviceId");
CREATE INDEX IF NOT EXISTS "OrgService_organizationId_published_deleted_idx" ON "OrgService"("organizationId", "published", "deleted");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgLocationId_idx" ON "ServiceArea"("active", "orgLocationId");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgServiceId_idx" ON "ServiceArea"("active", "orgServiceId");
CREATE INDEX IF NOT EXISTS "ServiceArea_active_organizationId_idx" ON "ServiceArea"("active", "organizationId");
CREATE INDEX IF NOT EXISTS "ServiceAreaCountry_active_serviceAreaId_idx" ON "ServiceAreaCountry"("active", "serviceAreaId");
CREATE INDEX IF NOT EXISTS "ServiceAreaDist_active_serviceAreaId_idx" ON "ServiceAreaDist"("active", "serviceAreaId");

-- 3. Update InternalNote foreign key (userId) to handle Cascade/Restrict changes
ALTER TABLE "InternalNote" DROP CONSTRAINT IF EXISTS "InternalNote_userId_fkey";
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
