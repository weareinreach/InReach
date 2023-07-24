-- DropIndex
DROP INDEX "GeoData_geo_idx";

-- DropIndex
DROP INDEX "OrgLocation_geo_idx";

-- CreateIndex
CREATE INDEX "AttributeToCategory_attributeId_idx" ON "AttributeToCategory"("attributeId");

-- CreateIndex
CREATE INDEX "AttributeToCategory_categoryId_idx" ON "AttributeToCategory"("categoryId");

-- CreateIndex
CREATE INDEX "GeoData_geo_idx" ON "GeoData" USING GIST("geo");

-- CreateIndex
CREATE INDEX "OrgLocation_geo_idx" ON "OrgLocation" USING GIST("geo");

-- CreateIndex
CREATE INDEX "OrgLocationService_serviceId_orgLocationId_idx" ON "OrgLocationService"("serviceId", "orgLocationId");

-- CreateIndex
CREATE INDEX "ServiceAreaCountry_serviceAreaId_countryId_active_idx" ON "ServiceAreaCountry"("serviceAreaId", "countryId", "active");

-- CreateIndex
CREATE INDEX "ServiceAreaDist_serviceAreaId_govDistId_active_idx" ON "ServiceAreaDist"("serviceAreaId", "govDistId", "active");

-- CreateIndex
CREATE INDEX "ServiceTagCountry_countryId_idx" ON "ServiceTagCountry"("countryId");

-- CreateIndex
CREATE INDEX "ServiceTagCountry_serviceId_idx" ON "ServiceTagCountry"("serviceId");

