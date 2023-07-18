-- DropIndex
DROP INDEX "AttributeSupplement_locationAttributeAttributeId_locationAt_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_organizationAttributeAttributeId_organi_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAttributeAttributeId_serviceAttr_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_userAttributeAttributeId_userAttributeU_idx";

-- CreateIndex
CREATE INDEX "AttributeSupplement_locationAttributeAttributeId_locationAt_idx" ON "AttributeSupplement"("locationAttributeAttributeId", "locationAttributeLocationId", "active");

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationAttributeAttributeId_organi_idx" ON "AttributeSupplement"("organizationAttributeAttributeId", "organizationAttributeOrganizationId", "active");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx" ON "AttributeSupplement"("serviceAccessAttributeAttributeId", "serviceAccessAttributeServiceId", "active");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAttributeAttributeId_serviceAttr_idx" ON "AttributeSupplement"("serviceAttributeAttributeId", "serviceAttributeOrgServiceId", "active");

-- CreateIndex
CREATE INDEX "AttributeSupplement_userAttributeAttributeId_userAttributeU_idx" ON "AttributeSupplement"("userAttributeAttributeId", "userAttributeUserId", "active");

-- CreateIndex
CREATE INDEX "ServiceAccessAttribute_attributeId_active_idx" ON "ServiceAccessAttribute"("attributeId", "active");

-- CreateIndex
CREATE INDEX "ServiceAccessAttribute_serviceId_active_idx" ON "ServiceAccessAttribute"("serviceId", "active");
