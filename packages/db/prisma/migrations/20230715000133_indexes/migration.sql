-- DropIndex
DROP INDEX "OrgLocationService_orgLocationId_idx";

-- DropIndex
DROP INDEX "OrgServiceTag_serviceId_idx";

-- CreateIndex
CREATE INDEX "LocationAttribute_attributeId_active_idx" ON "LocationAttribute"("attributeId", "active");

-- CreateIndex
CREATE INDEX "LocationAttribute_locationId_active_idx" ON "LocationAttribute"("locationId", "active");

-- CreateIndex
CREATE INDEX "OrgLocationService_orgLocationId_active_idx" ON "OrgLocationService"("orgLocationId", "active");

-- CreateIndex
CREATE INDEX "OrgLocationService_serviceId_active_idx" ON "OrgLocationService"("serviceId", "active");

-- CreateIndex
CREATE INDEX "OrgServiceTag_serviceId_active_idx" ON "OrgServiceTag"("serviceId", "active");

-- CreateIndex
CREATE INDEX "OrgServiceTag_tagId_active_idx" ON "OrgServiceTag"("tagId", "active");

-- CreateIndex
CREATE INDEX "OrganizationAttribute_organizationId_active_idx" ON "OrganizationAttribute"("organizationId", "active");

-- CreateIndex
CREATE INDEX "OrganizationAttribute_attributeId_active_idx" ON "OrganizationAttribute"("attributeId", "active");

-- CreateIndex
CREATE INDEX "ServiceAttribute_attributeId_active_idx" ON "ServiceAttribute"("attributeId", "active");

-- CreateIndex
CREATE INDEX "ServiceAttribute_orgServiceId_active_idx" ON "ServiceAttribute"("orgServiceId", "active");
