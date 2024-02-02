-- DropIndex
DROP INDEX "OrgService_organizationId_published_deleted_idx";

-- CreateIndex
CREATE INDEX "AttributeSupplement_active_attributeId_idx" ON
 "AttributeSupplement"("active", "attributeId")
WHERE
	active;

-- CreateIndex
CREATE INDEX "OrgLocationService_active_serviceId_idx" ON
 "OrgLocationService"("active", "serviceId")
WHERE
	active;

-- CreateIndex
CREATE INDEX "OrgService_organizationId_published_deleted_idx" ON
 "OrgService"("organizationId", "published" DESC, "deleted")
WHERE
	published AND NOT deleted;

-- CreateIndex
CREATE INDEX "ServiceArea_active_organizationId_idx" ON "ServiceArea"("active",
 "organizationId")
WHERE
	active;

-- CreateIndex
CREATE INDEX "ServiceArea_active_orgLocationId_idx" ON "ServiceArea"("active",
 "orgLocationId")
WHERE
	active;

-- CreateIndex
CREATE INDEX "ServiceArea_active_orgServiceId_idx" ON "ServiceArea"("active",
 "orgServiceId")
WHERE
	active;

-- CreateIndex
CREATE INDEX "ServiceAreaCountry_active_serviceAreaId_idx" ON
 "ServiceAreaCountry"("active", "serviceAreaId")
WHERE
	active;

-- CreateIndex
CREATE INDEX "ServiceAreaDist_active_serviceAreaId_idx" ON
 "ServiceAreaDist"("active", "serviceAreaId")
WHERE
	active;
