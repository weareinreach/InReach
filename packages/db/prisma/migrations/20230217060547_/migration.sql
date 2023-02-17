-- CreateIndex
CREATE INDEX "AttributeSupplement_locationAttributeAttributeId_locationAt_idx" ON "AttributeSupplement"("locationAttributeAttributeId", "locationAttributeLocationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationAttributeAttributeId_organi_idx" ON "AttributeSupplement"("organizationAttributeAttributeId", "organizationAttributeOrganizationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx" ON "AttributeSupplement"("serviceAccessAttributeAttributeId", "serviceAccessAttributeServiceAccessId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAttributeAttributeId_serviceAttr_idx" ON "AttributeSupplement"("serviceAttributeAttributeId", "serviceAttributeOrgServiceId");
