/*
 Warnings:

 - You are about to drop the column `orgLocationId` on the `OrgSocialMedia` table. All the data in the column will be lost.
 - You are about to drop the column `orgLocationId` on the `OrgWebsite` table. All the data in the column will be lost.
 */
-- DropForeignKey
ALTER TABLE "OrgSocialMedia"
	DROP CONSTRAINT "OrgSocialMedia_orgLocationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgWebsite"
	DROP CONSTRAINT "OrgWebsite_orgLocationId_fkey";

-- DropIndex
DROP INDEX "OrgLocation_deleted_idx";

-- DropIndex
DROP INDEX "OrgLocation_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgLocation_published_idx";

-- DropIndex
DROP INDEX "OrgService_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgSocialMedia_orgLocationId_idx";

-- DropIndex
DROP INDEX "OrgWebsite_orgLocationId_idx";

-- AlterTable
ALTER TABLE "OrgSocialMedia"
	DROP COLUMN "orgLocationId";

-- AlterTable
ALTER TABLE "OrgWebsite"
	DROP COLUMN "orgLocationId";

-- CreateTable
CREATE TABLE "OrgServiceWebsite"(
	"orgWebsiteId" text NOT NULL,
	"serviceId" text NOT NULL,
	"linkedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"active" boolean NOT NULL DEFAULT TRUE,
	CONSTRAINT "OrgServiceWebsite_pkey" PRIMARY KEY ("orgWebsiteId", "serviceId")
);

-- CreateTable
CREATE TABLE "OrgLocationWebsite"(
	"orgLocationId" text NOT NULL,
	"orgWebsiteId" text NOT NULL,
	"linkedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"active" boolean NOT NULL DEFAULT TRUE,
	CONSTRAINT "OrgLocationWebsite_pkey" PRIMARY KEY ("orgLocationId", "orgWebsiteId")
);

-- CreateTable
CREATE TABLE "OrgLocationSocialMedia"(
	"orgLocationId" text NOT NULL,
	"socialMediaId" text NOT NULL,
	"linkedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"active" boolean NOT NULL DEFAULT TRUE,
	CONSTRAINT "OrgLocationSocialMedia_pkey" PRIMARY KEY ("orgLocationId", "socialMediaId")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgServiceWebsite_serviceId_orgWebsiteId_idx" ON
 "OrgServiceWebsite"("serviceId", "orgWebsiteId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgLocationWebsite_orgWebsiteId_orgLocationId_idx"
 ON "OrgLocationWebsite"("orgWebsiteId", "orgLocationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS
 "OrgLocationSocialMedia_socialMediaId_orgLocationId_idx" ON
 "OrgLocationSocialMedia"("socialMediaId", "orgLocationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssignedRole_roleId_userId_idx" ON
 "AssignedRole"("roleId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttributeSupplement_active_attributeId_idx" ON
 "AttributeSupplement"("active", "attributeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FreeText_ns_key_idx" ON "FreeText"("ns", "key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ListSharedWith_listId_userId_idx" ON
 "ListSharedWith"("listId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LocationPermission_orgLocationId_userId_idx" ON
 "LocationPermission"("orgLocationId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LocationPermission_userId_orgLocationId_idx" ON
 "LocationPermission"("userId", "orgLocationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgEmail_id_published_deleted_idx" ON
 "OrgEmail"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgHours_id_active_idx" ON "OrgHours"("id", "active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgLocation_id_published_deleted_idx" ON
 "OrgLocation"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgLocationEmail_orgLocationId_orgEmailId_idx" ON
 "OrgLocationEmail"("orgLocationId", "orgEmailId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgLocationPhone_phoneId_orgLocationId_idx" ON
 "OrgLocationPhone"("phoneId", "orgLocationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgLocationService_active_serviceId_idx" ON
 "OrgLocationService"("active", "serviceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgPhone_id_published_deleted_idx" ON
 "OrgPhone"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgPhoneLanguage_languageId_orgPhoneId_idx" ON
 "OrgPhoneLanguage"("languageId", "orgPhoneId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgPhoto_id_published_deleted_idx" ON
 "OrgPhoto"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgService_organizationId_published_deleted_idx" ON
 "OrgService"("organizationId", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgService_id_published_deleted_idx" ON
 "OrgService"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgServiceEmail_serviceId_orgEmailId_idx" ON
 "OrgServiceEmail"("serviceId", "orgEmailId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgServicePhone_serviceId_orgPhoneId_idx" ON
 "OrgServicePhone"("serviceId", "orgPhoneId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgSocialMedia_id_published_deleted_idx" ON
 "OrgSocialMedia"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgWebsite_id_published_deleted_idx" ON
 "OrgWebsite"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgWebsiteLanguage_languageId_orgWebsiteId_idx" ON
 "OrgWebsiteLanguage"("languageId", "orgWebsiteId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Organization_slug_published_deleted_idx" ON
 "Organization"("slug", "published", "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Organization_id_published_deleted_idx" ON
 "Organization"("id", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrganizationEmail_organizationId_orgEmailId_idx" ON
 "OrganizationEmail"("organizationId", "orgEmailId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrganizationPermission_organizationId_userId_idx"
 ON "OrganizationPermission"("organizationId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrganizationPermission_userId_organizationId_idx"
 ON "OrganizationPermission"("userId", "organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrganizationPhone_phoneId_organizationId_idx" ON
 "OrganizationPhone"("phoneId", "organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RolePermission_permissionId_roleId_idx" ON
 "RolePermission"("permissionId", "roleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SavedOrganization_organizationId_listId_idx" ON
 "SavedOrganization"("organizationId", "listId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SavedService_serviceId_listId_idx" ON
 "SavedService"("serviceId", "listId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceArea_active_organizationId_idx" ON
 "ServiceArea"("active", "organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgLocationId_idx" ON
 "ServiceArea"("active", "orgLocationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgServiceId_idx" ON
 "ServiceArea"("active", "orgServiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaCountry_active_serviceAreaId_idx" ON
 "ServiceAreaCountry"("active", "serviceAreaId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaDist_active_serviceAreaId_idx" ON
 "ServiceAreaDist"("active", "serviceAreaId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceTagToCategory_serviceTagId_categoryId_idx"
 ON "ServiceTagToCategory"("serviceTagId", "categoryId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserMail_fromUserId_toUserId_idx" ON
 "UserMail"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserPermission_permissionId_userId_idx" ON
 "UserPermission"("permissionId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserToOrganization_organizationId_userId_idx" ON
 "UserToOrganization"("organizationId", "userId");

-- AddForeignKey
ALTER TABLE "OrgServiceWebsite"
	ADD CONSTRAINT "OrgServiceWebsite_orgWebsiteId_fkey" FOREIGN KEY
	("orgWebsiteId") REFERENCES "OrgWebsite"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgServiceWebsite"
	ADD CONSTRAINT "OrgServiceWebsite_serviceId_fkey" FOREIGN KEY
	("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE
	CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocationWebsite"
	ADD CONSTRAINT "OrgLocationWebsite_orgLocationId_fkey" FOREIGN KEY
	("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocationWebsite"
	ADD CONSTRAINT "OrgLocationWebsite_orgWebsiteId_fkey" FOREIGN KEY
	("orgWebsiteId") REFERENCES "OrgWebsite"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocationSocialMedia"
	ADD CONSTRAINT "OrgLocationSocialMedia_orgLocationId_fkey" FOREIGN KEY
	("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocationSocialMedia"
	ADD CONSTRAINT "OrgLocationSocialMedia_socialMediaId_fkey" FOREIGN KEY
	("socialMediaId") REFERENCES "OrgSocialMedia"("id") ON DELETE CASCADE
	ON UPDATE CASCADE;
