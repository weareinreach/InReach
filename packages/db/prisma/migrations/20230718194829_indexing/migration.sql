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
DROP INDEX "FreeText_id_key_ns_idx";

-- DropIndex
DROP INDEX "OrgEmail_id_descriptionId_idx";

-- DropIndex
DROP INDEX "OrgEmail_id_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgHours_id_orgLocId_idx";

-- DropIndex
DROP INDEX "OrgHours_id_orgServiceId_idx";

-- DropIndex
DROP INDEX "OrgHours_id_organizationId_idx";

-- DropIndex
DROP INDEX "OrgLocation_descriptionId_id_idx";

-- DropIndex
DROP INDEX "OrgLocation_geo_id_idx";

-- DropIndex
DROP INDEX "OrgLocation_id_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgLocation_orgId_id_idx";

-- DropIndex
DROP INDEX "OrgPhone_id_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgPhoto_id_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgReview_orgLocationId_id_idx";

-- DropIndex
DROP INDEX "OrgReview_orgServiceId_id_idx";

-- DropIndex
DROP INDEX "OrgReview_organizationId_id_idx";

-- DropIndex
DROP INDEX "OrgSocialMedia_id_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgWebsite_id_published_deleted_idx";

-- DropIndex
DROP INDEX "Organization_id_published_deleted_idx";

-- DropIndex
DROP INDEX "ServiceArea_orgLocationId_active_idx";

-- DropIndex
DROP INDEX "ServiceArea_orgServiceId_active_idx";

-- DropIndex
DROP INDEX "ServiceArea_organizationId_active_idx";

-- DropIndex
DROP INDEX "ServiceTag_categoryId_id_idx";

-- DropIndex
DROP INDEX "TranslatedReview_reviewId_languageId_id_idx";

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_locationAttributeAttributeId_locationAt_idx" ON "AttributeSupplement"("locationAttributeAttributeId", "locationAttributeLocationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationAttributeAttributeId_organi_idx" ON "AttributeSupplement"("organizationAttributeAttributeId", "organizationAttributeOrganizationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx" ON "AttributeSupplement"("serviceAccessAttributeAttributeId", "serviceAccessAttributeServiceId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAttributeAttributeId_serviceAttr_idx" ON "AttributeSupplement"("serviceAttributeAttributeId", "serviceAttributeOrgServiceId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_userAttributeAttributeId_userAttributeU_idx" ON "AttributeSupplement"("userAttributeAttributeId", "userAttributeUserId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_locationAttributeAttributeId_idx" ON "AttributeSupplement"("locationAttributeAttributeId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_locationAttributeLocationId_idx" ON "AttributeSupplement"("locationAttributeLocationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationAttributeAttributeId_idx" ON "AttributeSupplement"("organizationAttributeAttributeId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationAttributeOrganizationId_idx" ON "AttributeSupplement"("organizationAttributeOrganizationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_idx" ON "AttributeSupplement"("serviceAccessAttributeAttributeId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeServiceId_idx" ON "AttributeSupplement"("serviceAccessAttributeServiceId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAttributeAttributeId_idx" ON "AttributeSupplement"("serviceAttributeAttributeId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAttributeOrgServiceId_idx" ON "AttributeSupplement"("serviceAttributeOrgServiceId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_userAttributeAttributeId_idx" ON "AttributeSupplement"("userAttributeAttributeId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_userAttributeUserId_idx" ON "AttributeSupplement"("userAttributeUserId");

-- CreateIndex
CREATE INDEX "FreeText_key_idx" ON "FreeText"("key");

-- CreateIndex
CREATE INDEX "LocationAttribute_attributeId_idx" ON "LocationAttribute"("attributeId");

-- CreateIndex
CREATE INDEX "LocationAttribute_locationId_idx" ON "LocationAttribute"("locationId");

-- CreateIndex
CREATE INDEX "OrgHours_orgLocId_idx" ON "OrgHours"("orgLocId");

-- CreateIndex
CREATE INDEX "OrgHours_orgServiceId_idx" ON "OrgHours"("orgServiceId");

-- CreateIndex
CREATE INDEX "OrgHours_organizationId_idx" ON "OrgHours"("organizationId");

-- CreateIndex
CREATE INDEX "OrgLocation_countryId_idx" ON "OrgLocation"("countryId");

-- CreateIndex
CREATE INDEX "OrgLocation_govDistId_idx" ON "OrgLocation"("govDistId");

-- CreateIndex
CREATE INDEX "OrgLocationService_orgLocationId_idx" ON "OrgLocationService"("orgLocationId");

-- CreateIndex
CREATE INDEX "OrgLocationService_serviceId_idx" ON "OrgLocationService"("serviceId");

-- CreateIndex
CREATE INDEX "OrgPhoto_orgId_idx" ON "OrgPhoto"("orgId");

-- CreateIndex
CREATE INDEX "OrgPhoto_orgLocationId_idx" ON "OrgPhoto"("orgLocationId");

-- CreateIndex
CREATE INDEX "OrgReview_orgLocationId_idx" ON "OrgReview"("orgLocationId");

-- CreateIndex
CREATE INDEX "OrgReview_userId_idx" ON "OrgReview"("userId");

-- CreateIndex
CREATE INDEX "OrgServiceTag_serviceId_idx" ON "OrgServiceTag"("serviceId");

-- CreateIndex
CREATE INDEX "OrgServiceTag_tagId_idx" ON "OrgServiceTag"("tagId");

-- CreateIndex
CREATE INDEX "OrgSocialMedia_serviceId_idx" ON "OrgSocialMedia"("serviceId");

-- CreateIndex
CREATE INDEX "OrgSocialMedia_organizationId_idx" ON "OrgSocialMedia"("organizationId");

-- CreateIndex
CREATE INDEX "OrgSocialMedia_orgLocationId_idx" ON "OrgSocialMedia"("orgLocationId");

-- CreateIndex
CREATE INDEX "OrgWebsite_organizationId_idx" ON "OrgWebsite"("organizationId");

-- CreateIndex
CREATE INDEX "OrgWebsite_orgLocationId_idx" ON "OrgWebsite"("orgLocationId");

-- CreateIndex
CREATE INDEX "ServiceAccessAttribute_attributeId_idx" ON "ServiceAccessAttribute"("attributeId");

-- CreateIndex
CREATE INDEX "ServiceAccessAttribute_serviceId_idx" ON "ServiceAccessAttribute"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceArea_organizationId_idx" ON "ServiceArea"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceArea_orgLocationId_idx" ON "ServiceArea"("orgLocationId");

-- CreateIndex
CREATE INDEX "ServiceArea_orgServiceId_idx" ON "ServiceArea"("orgServiceId");

-- CreateIndex
CREATE INDEX "ServiceAreaCountry_serviceAreaId_idx" ON "ServiceAreaCountry"("serviceAreaId");

-- CreateIndex
CREATE INDEX "ServiceAreaCountry_countryId_idx" ON "ServiceAreaCountry"("countryId");

-- CreateIndex
CREATE INDEX "ServiceAreaDist_serviceAreaId_idx" ON "ServiceAreaDist"("serviceAreaId");

-- CreateIndex
CREATE INDEX "ServiceAreaDist_govDistId_idx" ON "ServiceAreaDist"("govDistId");

-- CreateIndex
CREATE INDEX "ServiceAttribute_attributeId_idx" ON "ServiceAttribute"("attributeId");

-- CreateIndex
CREATE INDEX "ServiceAttribute_orgServiceId_idx" ON "ServiceAttribute"("orgServiceId");

-- CreateIndex
CREATE INDEX "SlugRedirect_orgId_idx" ON "SlugRedirect"("orgId");

-- CreateIndex
CREATE INDEX "Suggestion_organizationId_idx" ON "Suggestion"("organizationId");

-- CreateIndex
CREATE INDEX "TranslatedReview_reviewId_languageId_idx" ON "TranslatedReview"("reviewId", "languageId");

-- CreateIndex
CREATE INDEX "TranslationKey_crowdinId_idx" ON "TranslationKey"("crowdinId");

-- CreateIndex
CREATE INDEX "TranslationKey_key_idx" ON "TranslationKey"("key");

-- CreateIndex
CREATE INDEX "User_userTypeId_idx" ON "User"("userTypeId");

-- CreateIndex
CREATE INDEX "UserMail_toUserId_idx" ON "UserMail"("toUserId");

-- CreateIndex
CREATE INDEX "UserMail_fromUserId_idx" ON "UserMail"("fromUserId");

-- CreateIndex
CREATE INDEX "UserMail_responseToId_idx" ON "UserMail"("responseToId");
