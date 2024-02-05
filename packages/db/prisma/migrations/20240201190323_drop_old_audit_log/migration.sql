/*
 Warnings:

 - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
 */
-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_attributeCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_attributeSupplementDataSchemaId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_attributeSupplementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_countryId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_fieldVisibilityId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_freeTextId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_govDistId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_govDistTypeId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_internalNoteId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_languageId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_locationPermissionUserId_locationPermissionPermis_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgEmailId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgHoursId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgLocationId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgPhoneId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgPhotoId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgReviewId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgServiceId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgSocialMediaId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_orgWebsiteId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_organizationPermissionUserId_organizationPermissi_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_outsideAPIId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_outsideAPIServiceService_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_phoneTypeId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_serviceAreaId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_serviceCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_serviceTagId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_slugRedirectId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_socialMediaLinkId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_socialMediaServiceId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_suggestionId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_translatedReviewId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_translationKey_translationNs_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_translationNamespaceName_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userCommunityId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userEthnicityId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userImmigrationId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userMailId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userRoleId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userSOGIdentityId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userSavedListId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userTitleId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_userTypeId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropEnum
DROP TYPE "AuditLogOperation";
