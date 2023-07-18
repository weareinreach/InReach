-- DropIndex
DROP INDEX "ServiceArea_orgLocationId_id_idx";

-- DropIndex
DROP INDEX "ServiceArea_orgServiceId_id_idx";

-- DropIndex
DROP INDEX "ServiceArea_organizationId_id_idx";

-- CreateIndex
CREATE INDEX "OrgService_organizationId_published_deleted_idx" ON "OrgService"("organizationId", "published", "deleted");

-- CreateIndex
CREATE INDEX "ServiceArea_organizationId_active_idx" ON "ServiceArea"("organizationId", "active");

-- CreateIndex
CREATE INDEX "ServiceArea_orgLocationId_active_idx" ON "ServiceArea"("orgLocationId", "active");

-- CreateIndex
CREATE INDEX "ServiceArea_orgServiceId_active_idx" ON "ServiceArea"("orgServiceId", "active");

-- CreateIndex
CREATE INDEX "ServiceAreaCountry_serviceAreaId_active_idx" ON "ServiceAreaCountry"("serviceAreaId", "active");

-- CreateIndex
CREATE INDEX "ServiceAreaDist_serviceAreaId_active_idx" ON "ServiceAreaDist"("serviceAreaId", "active");
