-- CreateIndex
CREATE INDEX "OrgLocation_orgId_id_idx" ON "OrgLocation"("orgId", "id");

-- CreateIndex
CREATE INDEX "Organization_id_published_deleted_idx" ON "Organization"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "OrgLocation_orgId_id_geo_idx" ON "OrgLocation"("orgId", "id", "geo");

-- DropIndex
DROP INDEX "OrgLocation_orgId_id_geo_idx";

-- CreateIndex
CREATE INDEX "OrgLocation_geo_orgId_id_idx" ON "OrgLocation"("geo", "orgId", "id");

-- CreateIndex
CREATE INDEX "OrgLocation_orgId_id_geo_idx" ON "OrgLocation"("orgId", "id", "geo");

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

-- DropIndex
DROP INDEX "OrgLocation_geoJSON_idx";

-- DropIndex
DROP INDEX "OrgLocation_geo_orgId_id_idx";

-- DropIndex
DROP INDEX "OrgLocation_latitude_longitude_idx";

-- DropIndex
DROP INDEX "ServiceTag_tsKey_tsNs_idx";

-- DropIndex
DROP INDEX "TranslatedReview_reviewId_idx";

-- CreateIndex
CREATE INDEX "AttributeSupplement_locationAttributeAttributeId_locationAt_idx" ON "AttributeSupplement"(
	"locationAttributeAttributeId",
	"locationAttributeLocationId",
	"id"
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationAttributeAttributeId_organi_idx" ON "AttributeSupplement"(
	"organizationAttributeAttributeId",
	"organizationAttributeOrganizationId",
	"id"
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx" ON "AttributeSupplement"(
	"serviceAccessAttributeAttributeId",
	"serviceAccessAttributeServiceAccessId",
	"id"
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAttributeAttributeId_serviceAttr_idx" ON "AttributeSupplement"(
	"serviceAttributeAttributeId",
	"serviceAttributeOrgServiceId",
	"id"
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_userAttributeAttributeId_userAttributeU_idx" ON "AttributeSupplement"(
	"userAttributeAttributeId",
	"userAttributeUserId",
	"id"
);

-- CreateIndex
CREATE INDEX "FreeText_id_key_ns_idx" ON "FreeText"("id", "key", "ns");

-- CreateIndex
CREATE INDEX "GovDist_countryId_id_idx" ON "GovDist"("countryId", "id");

-- CreateIndex
CREATE INDEX "GovDist_parentId_id_idx" ON "GovDist"("parentId", "id");

-- CreateIndex
CREATE INDEX "OrgEmail_id_descriptionId_idx" ON "OrgEmail"("id", "descriptionId");

-- CreateIndex
CREATE INDEX "OrgEmail_id_published_deleted_idx" ON "OrgEmail"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "OrgHours_id_orgLocId_idx" ON "OrgHours"("id", "orgLocId");

-- CreateIndex
CREATE INDEX "OrgHours_id_orgServiceId_idx" ON "OrgHours"("id", "orgServiceId");

-- CreateIndex
CREATE INDEX "OrgHours_id_organizationId_idx" ON "OrgHours"("id", "organizationId");

-- CreateIndex
CREATE INDEX "OrgLocation_descriptionId_id_idx" ON "OrgLocation"("descriptionId", "id");

-- CreateIndex
CREATE INDEX "OrgLocation_id_published_deleted_idx" ON "OrgLocation"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "OrgLocation_geo_id_idx" ON "OrgLocation"("geo", "id");

-- CreateIndex
CREATE INDEX "OrgPhone_id_published_deleted_idx" ON "OrgPhone"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "OrgPhoto_id_published_deleted_idx" ON "OrgPhoto"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "OrgReview_id_visible_deleted_idx" ON "OrgReview"("id", "visible", "deleted");

-- CreateIndex
CREATE INDEX "OrgReview_organizationId_id_idx" ON "OrgReview"("organizationId", "id");

-- CreateIndex
CREATE INDEX "OrgReview_orgLocationId_id_idx" ON "OrgReview"("orgLocationId", "id");

-- CreateIndex
CREATE INDEX "OrgReview_orgServiceId_id_idx" ON "OrgReview"("orgServiceId", "id");

-- CreateIndex
CREATE INDEX "OrgService_id_serviceNameId_descriptionId_idx" ON "OrgService"("id", "serviceNameId", "descriptionId");

-- CreateIndex
CREATE INDEX "OrgService_id_published_deleted_idx" ON "OrgService"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "OrgService_id_organizationId_idx" ON "OrgService"("id", "organizationId");

-- CreateIndex
CREATE INDEX "OrgService_organizationId_id_idx" ON "OrgService"("organizationId", "id");

-- CreateIndex
CREATE INDEX "OrgSocialMedia_id_published_deleted_idx" ON "OrgSocialMedia"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "OrgWebsite_id_published_deleted_idx" ON "OrgWebsite"("id", "published", "deleted");

-- CreateIndex
CREATE INDEX "ServiceAccess_serviceId_id_idx" ON "ServiceAccess"("serviceId", "id");

-- CreateIndex
CREATE INDEX "ServiceArea_organizationId_id_idx" ON "ServiceArea"("organizationId", "id");

-- CreateIndex
CREATE INDEX "ServiceArea_orgLocationId_id_idx" ON "ServiceArea"("orgLocationId", "id");

-- CreateIndex
CREATE INDEX "ServiceArea_orgServiceId_id_idx" ON "ServiceArea"("orgServiceId", "id");

-- CreateIndex
CREATE INDEX "ServiceTag_categoryId_id_idx" ON "ServiceTag"("categoryId", "id");

-- CreateIndex
CREATE INDEX "TranslatedReview_reviewId_languageId_id_idx" ON "TranslatedReview"("reviewId", "languageId", "id");

-- CreateIndex
CREATE INDEX "ServiceAttribute_attributeId_orgServiceId_idx" ON "ServiceAttribute"("attributeId", "orgServiceId");