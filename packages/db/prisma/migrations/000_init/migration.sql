-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('INCLUDE', 'EXCLUDE');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('EXTERNAL', 'ORGANIZATION', 'SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "TranslationPlurals" AS ENUM ('SINGLE', 'PLURAL', 'ORDINAL');

-- CreateEnum
CREATE TYPE "VisibilitySetting" AS ENUM ('NONE', 'LOGGED_IN', 'PROVIDER', 'PUBLIC');

-- CreateEnum
CREATE TYPE "AuditLogOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK');

-- CreateTable
CREATE TABLE "Account" (
	"id" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"provider" TEXT NOT NULL,
	"providerAccountId" TEXT NOT NULL,
	"refresh_token" TEXT,
	"access_token" TEXT,
	"expires_at" INTEGER,
	"token_type" TEXT,
	"scope" TEXT,
	"id_token" TEXT,
	"session_state" TEXT,
	"userId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
	"id" TEXT NOT NULL,
	"sessionToken" TEXT NOT NULL,
	"expires" TIMESTAMP(3) NOT NULL,
	"userId" TEXT NOT NULL,
	CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
	"identifier" TEXT NOT NULL,
	"token" TEXT NOT NULL,
	"expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
	"id" TEXT NOT NULL,
	"name" TEXT,
	"email" TEXT NOT NULL,
	"emailVerified" TIMESTAMP(3),
	"image" TEXT,
	"legacyId" TEXT,
	"active" BOOLEAN NOT NULL DEFAULT true,
	"currentCity" TEXT,
	"currentGovDistId" TEXT,
	"currentCountryId" TEXT,
	"legacyHash" TEXT,
	"legacySalt" TEXT,
	"migrateDate" TIMESTAMP(3),
	"userTypeId" TEXT NOT NULL,
	"langPrefId" TEXT,
	"sourceId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"tag" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserType" (
	"id" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTitle" (
	"id" TEXT NOT NULL,
	"title" TEXT NOT NULL,
	"searchable" BOOLEAN NOT NULL DEFAULT false,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSurvey" (
	"id" TEXT NOT NULL,
	"birthYear" SMALLINT,
	"reasonForJoin" TEXT,
	"countryOriginId" TEXT,
	"immigrationId" TEXT,
	"currentCity" TEXT,
	"currentGovDistId" TEXT,
	"currentCountryId" TEXT,
	CONSTRAINT "UserSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEthnicity" (
	"id" TEXT NOT NULL,
	"ethnicity" TEXT NOT NULL,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserEthnicity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImmigration" (
	"id" TEXT NOT NULL,
	"status" TEXT NOT NULL,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserImmigration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSOGIdentity" (
	"id" TEXT NOT NULL,
	"identifyAs" TEXT NOT NULL,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserSOGIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCommunity" (
	"id" TEXT NOT NULL,
	"community" TEXT NOT NULL,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSavedList" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"sharedLinkKey" TEXT,
	"ownedById" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserSavedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMail" (
	"id" TEXT NOT NULL,
	"toUserId" TEXT NOT NULL,
	"toExternal" TEXT [],
	"read" BOOLEAN NOT NULL DEFAULT false,
	"subject" TEXT NOT NULL,
	"body" TEXT NOT NULL,
	"from" TEXT,
	"fromUserId" TEXT,
	"responseToId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "UserMail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"name" TEXT NOT NULL,
	"slug" TEXT NOT NULL,
	"legacySlug" TEXT,
	"descriptionId" TEXT,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"published" BOOLEAN NOT NULL DEFAULT false,
	"lastVerified" TIMESTAMP(3),
	"sourceId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	"checkMigration" BOOLEAN,
	CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgEmail" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"legacyDesc" TEXT,
	"firstName" TEXT,
	"lastName" TEXT,
	"primary" BOOLEAN NOT NULL DEFAULT false,
	"email" TEXT NOT NULL,
	"published" BOOLEAN NOT NULL DEFAULT true,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"titleId" TEXT,
	"orgId" TEXT,
	"locationOnly" BOOLEAN NOT NULL DEFAULT false,
	"serviceOnly" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrgEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgPhone" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"legacyDesc" TEXT,
	"number" TEXT NOT NULL,
	"ext" TEXT,
	"primary" BOOLEAN NOT NULL DEFAULT false,
	"published" BOOLEAN NOT NULL DEFAULT true,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"migrationReview" BOOLEAN,
	"countryId" TEXT NOT NULL,
	"phoneTypeId" TEXT,
	"organizationId" TEXT,
	"locationOnly" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrgPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgSocialMedia" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"username" TEXT NOT NULL,
	"url" TEXT NOT NULL,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"published" BOOLEAN NOT NULL DEFAULT true,
	"serviceId" TEXT NOT NULL,
	"organizationId" TEXT NOT NULL,
	"orgLocationId" TEXT,
	"orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrgSocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgWebsite" (
	"id" TEXT NOT NULL,
	"url" TEXT NOT NULL,
	"descriptionId" TEXT,
	"organizationId" TEXT NOT NULL,
	"orgLocationId" TEXT,
	"orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrgWebsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgLocation" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"name" TEXT,
	"street1" TEXT NOT NULL,
	"street2" TEXT,
	"city" TEXT NOT NULL,
	"postCode" TEXT,
	"primary" BOOLEAN NOT NULL DEFAULT true,
	"govDistId" TEXT,
	"countryId" TEXT NOT NULL,
	"longitude" DECIMAL(7, 4),
	"latitude" DECIMAL(7, 4),
	"geo" Geometry(POINT, 4326),
	"geoJSON" JSONB NOT NULL,
	"geoWKT" TEXT,
	"published" BOOLEAN NOT NULL DEFAULT true,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"orgId" TEXT NOT NULL,
	"apiLocationId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	"checkMigration" BOOLEAN,
	CONSTRAINT "OrgLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgPhoto" (
	"id" TEXT NOT NULL,
	"src" TEXT NOT NULL,
	"height" SMALLINT,
	"width" SMALLINT,
	"published" BOOLEAN NOT NULL DEFAULT false,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"orgId" TEXT,
	"orgLocationId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrgPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgHours" (
	"id" TEXT NOT NULL,
	"dayIndex" SMALLINT NOT NULL DEFAULT 0,
	"start" TIME(0) NOT NULL,
	"end" TIME(0) NOT NULL,
	"closed" BOOLEAN NOT NULL DEFAULT false,
	"orgLocId" TEXT,
	"orgServiceId" TEXT,
	"organizationId" TEXT,
	"needAssignment" BOOLEAN NOT NULL DEFAULT false,
	"needReview" BOOLEAN NOT NULL DEFAULT false,
	"legacyId" TEXT,
	"legacyName" TEXT,
	"legacyNote" TEXT,
	"legacyStart" TEXT,
	"legacyEnd" TEXT,
	"legacyTz" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrgHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreeText" (
	"id" TEXT NOT NULL,
	"key" TEXT NOT NULL,
	"ns" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "FreeText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgService" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"published" BOOLEAN NOT NULL DEFAULT false,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"legacyName" TEXT,
	"descriptionId" TEXT,
	"organizationId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	"checkMigration" BOOLEAN,
	CONSTRAINT "OrgService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceArea" (
	"id" TEXT NOT NULL,
	"organizationId" TEXT,
	"orgLocationId" TEXT,
	"orgServiceId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAccess" (
	"id" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "ServiceAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgReview" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"rating" SMALLINT,
	"reviewText" TEXT,
	"visible" BOOLEAN NOT NULL DEFAULT true,
	"deleted" BOOLEAN NOT NULL DEFAULT false,
	"userId" TEXT NOT NULL,
	"organizationId" TEXT NOT NULL,
	"orgServiceId" TEXT,
	"orgLocationId" TEXT,
	"langId" TEXT,
	"langConfidence" DOUBLE PRECISION,
	"toxicity" DOUBLE PRECISION,
	"lcrCity" TEXT,
	"lcrGovDistId" TEXT,
	"lcrCountryId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrgReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslatedReview" (
	"id" TEXT NOT NULL,
	"reviewId" TEXT NOT NULL,
	"languageId" TEXT NOT NULL,
	"text" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "TranslatedReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeCategory" (
	"id" TEXT NOT NULL,
	"tag" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"icon" TEXT,
	"intDesc" TEXT,
	"active" BOOLEAN NOT NULL DEFAULT true,
	"ns" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "AttributeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribute" (
	"id" TEXT NOT NULL,
	"tag" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"icon" TEXT,
	"intDesc" TEXT,
	"active" BOOLEAN NOT NULL DEFAULT true,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"requireText" BOOLEAN NOT NULL DEFAULT false,
	"requireLanguage" BOOLEAN NOT NULL DEFAULT false,
	"requireCountry" BOOLEAN NOT NULL DEFAULT false,
	"requireBoolean" BOOLEAN NOT NULL DEFAULT false,
	"requireData" BOOLEAN NOT NULL DEFAULT false,
	"filterType" "FilterType",
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeSupplement" (
	"id" TEXT NOT NULL,
	"active" BOOLEAN NOT NULL DEFAULT true,
	"data" JSONB,
	"boolean" BOOLEAN,
	"textId" TEXT,
	"countryId" TEXT,
	"languageId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	"locationAttributeAttributeId" TEXT,
	"locationAttributeLocationId" TEXT,
	"organizationAttributeAttributeId" TEXT,
	"organizationAttributeOrganizationId" TEXT,
	"serviceAccessAttributeAttributeId" TEXT,
	"serviceAccessAttributeServiceAccessId" TEXT,
	"serviceAttributeAttributeId" TEXT,
	"serviceAttributeOrgServiceId" TEXT,
	CONSTRAINT "AttributeSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
	"id" TEXT NOT NULL,
	"category" TEXT NOT NULL,
	"active" BOOLEAN NOT NULL DEFAULT true,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTag" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"active" BOOLEAN NOT NULL DEFAULT true,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"categoryId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "ServiceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneType" (
	"id" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "PhoneType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaService" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"urlBase" TEXT [],
	"logoIcon" TEXT NOT NULL,
	"internal" BOOLEAN NOT NULL DEFAULT false,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "SocialMediaService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
	"id" TEXT NOT NULL,
	"source" TEXT NOT NULL,
	"type" "SourceType" NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
	"id" TEXT NOT NULL,
	"cca2" CHAR(2) NOT NULL,
	"cca3" CHAR(3) NOT NULL,
	"name" TEXT NOT NULL,
	"dialCode" SMALLINT,
	"flag" TEXT NOT NULL,
	"geo" Geometry(GEOMETRY, 4326),
	"geoJSON" JSONB,
	"geoWKT" TEXT,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"demonymKey" TEXT,
	"demonymNs" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovDist" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"slug" TEXT NOT NULL,
	"iso" TEXT,
	"abbrev" TEXT,
	"geo" Geometry(GEOMETRY, 4326),
	"geoJSON" JSONB,
	"geoWKT" TEXT,
	"countryId" TEXT NOT NULL,
	"govDistTypeId" TEXT NOT NULL,
	"isPrimary" BOOLEAN DEFAULT true,
	"parentId" TEXT,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "GovDist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovDistType" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "GovDistType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
	"id" TEXT NOT NULL,
	"languageName" TEXT NOT NULL,
	"localeCode" TEXT NOT NULL,
	"iso6392" CHAR(3),
	"nativeName" TEXT NOT NULL,
	"activelyTranslated" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationNamespace" (
	"name" TEXT NOT NULL,
	"exportFile" BOOLEAN NOT NULL DEFAULT true,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "TranslationNamespace_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "TranslationKey" (
	"key" TEXT NOT NULL,
	"text" TEXT NOT NULL,
	"context" TEXT,
	"ns" TEXT NOT NULL,
	"plural" "TranslationPlurals" NOT NULL DEFAULT 'SINGLE',
	"pluralValues" JSONB,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "TranslationKey_pkey" PRIMARY KEY ("ns", "key")
);

-- CreateTable
CREATE TABLE "OutsideAPIService" (
	"service" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"urlPattern" TEXT NOT NULL,
	"apiKey" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OutsideAPIService_pkey" PRIMARY KEY ("service")
);

-- CreateTable
CREATE TABLE "OutsideAPI" (
	"id" TEXT NOT NULL,
	"apiIdentifier" TEXT NOT NULL,
	"serviceName" TEXT NOT NULL,
	"organizationId" TEXT,
	"orgLocationId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OutsideAPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldVisibility" (
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"name" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"email" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"image" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"ethnicity" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"countryOrigin" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"SOG" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"communities" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"currentCity" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"currentGovDist" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"currentCountry" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"userType" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"associatedOrg" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"orgTitle" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"createdAt" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
	"recordCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"recordupdatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "FieldVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Navigation" (
	"id" TEXT NOT NULL,
	"display" TEXT NOT NULL,
	"href" TEXT,
	"isParent" BOOLEAN NOT NULL DEFAULT true,
	"icon" TEXT,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"parentId" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Navigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
	"id" TEXT NOT NULL,
	"display" TEXT NOT NULL,
	"href" TEXT NOT NULL,
	"icon" TEXT,
	"tsKey" TEXT NOT NULL,
	"tsNs" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaLink" (
	"id" TEXT NOT NULL,
	"href" TEXT NOT NULL,
	"icon" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "SocialMediaLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalNote" (
	"id" TEXT NOT NULL,
	"legacyId" TEXT,
	"text" TEXT NOT NULL,
	"attributeId" TEXT,
	"attributeCategoryId" TEXT,
	"attributeSupplementId" TEXT,
	"countryId" TEXT,
	"footerLinkId" TEXT,
	"govDistId" TEXT,
	"govDistTypeId" TEXT,
	"languageId" TEXT,
	"navigationId" TEXT,
	"organizationId" TEXT,
	"orgEmailId" TEXT,
	"orgHoursId" TEXT,
	"orgLocationId" TEXT,
	"orgPhoneId" TEXT,
	"orgPhotoId" TEXT,
	"orgReviewId" TEXT,
	"orgServiceId" TEXT,
	"orgSocialMediaId" TEXT,
	"orgWebsiteId" TEXT,
	"outsideApiId" TEXT,
	"outsideAPIServiceService" TEXT,
	"permissionId" TEXT,
	"phoneTypeId" TEXT,
	"serviceAccessId" TEXT,
	"serviceCategoryId" TEXT,
	"serviceTagId" TEXT,
	"socialMediaLinkId" TEXT,
	"socialMediaServiceId" TEXT,
	"sourceId" TEXT,
	"translationKey" TEXT,
	"translationNs" TEXT,
	"translationNamespaceName" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
	"id" TEXT NOT NULL,
	"actorId" TEXT NOT NULL,
	"timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"from" JSONB NOT NULL,
	"to" JSONB NOT NULL,
	"operation" "AuditLogOperation" NOT NULL,
	"accountId" TEXT,
	"attributeId" TEXT,
	"attributeCategoryId" TEXT,
	"attributeSupplementId" TEXT,
	"countryId" TEXT,
	"fieldVisibilityId" TEXT,
	"footerLinkId" TEXT,
	"freeTextId" TEXT,
	"govDistId" TEXT,
	"govDistTypeId" TEXT,
	"internalNoteId" TEXT,
	"languageId" TEXT,
	"locationPermissionUserId" TEXT,
	"locationPermissionPermissionId" TEXT,
	"locationPermissionOrgLocationId" TEXT,
	"navigationId" TEXT,
	"organizationId" TEXT,
	"organizationPermissionUserId" TEXT,
	"organizationPermissionPermissionId" TEXT,
	"organizationPermissionOrganizationId" TEXT,
	"orgEmailId" TEXT,
	"orgHoursId" TEXT,
	"orgLocationId" TEXT,
	"orgPhoneId" TEXT,
	"orgPhotoId" TEXT,
	"orgReviewId" TEXT,
	"orgServiceId" TEXT,
	"orgSocialMediaId" TEXT,
	"orgWebsiteId" TEXT,
	"outsideAPIId" TEXT,
	"outsideAPIServiceService" TEXT,
	"permissionId" TEXT,
	"phoneTypeId" TEXT,
	"serviceAccessId" TEXT,
	"serviceAreaId" TEXT,
	"serviceCategoryId" TEXT,
	"serviceTagId" TEXT,
	"socialMediaLinkId" TEXT,
	"socialMediaServiceId" TEXT,
	"sourceId" TEXT,
	"translatedReviewId" TEXT,
	"translationKey" TEXT,
	"translationNs" TEXT,
	"translationNamespaceName" TEXT,
	"userId" TEXT,
	"userCommunityId" TEXT,
	"userEthnicityId" TEXT,
	"userImmigrationId" TEXT,
	"userMailId" TEXT,
	"userRoleId" TEXT,
	"userSavedListId" TEXT,
	"userSOGIdentityId" TEXT,
	"userTitleId" TEXT,
	"userTypeId" TEXT,
	CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
	"userId" TEXT NOT NULL,
	"permissionId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId", "permissionId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
	"roleId" TEXT NOT NULL,
	"permissionId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

-- CreateTable
CREATE TABLE "UserToOrganization" (
	"userId" TEXT NOT NULL,
	"organizationId" TEXT NOT NULL,
	"orgTitleId" TEXT,
	"orgEmailId" TEXT,
	"orgPhoneId" TEXT,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "UserToOrganization_pkey" PRIMARY KEY ("userId", "organizationId")
);

-- CreateTable
CREATE TABLE "OrganizationPermission" (
	"userId" TEXT NOT NULL,
	"permissionId" TEXT NOT NULL,
	"authorized" BOOLEAN NOT NULL DEFAULT false,
	"organizationId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "OrganizationPermission_pkey" PRIMARY KEY ("userId", "permissionId", "organizationId")
);

-- CreateTable
CREATE TABLE "LocationPermission" (
	"userId" TEXT NOT NULL,
	"permissionId" TEXT NOT NULL,
	"authorized" BOOLEAN NOT NULL DEFAULT false,
	"orgLocationId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "LocationPermission_pkey" PRIMARY KEY ("userId", "permissionId", "orgLocationId")
);

-- CreateTable
CREATE TABLE "UserCommunityLink" (
	"userId" TEXT NOT NULL,
	"communityId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "UserCommunityLink_pkey" PRIMARY KEY ("userId", "communityId")
);

-- CreateTable
CREATE TABLE "UserSOGLink" (
	"userId" TEXT NOT NULL,
	"sogIdentityId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "UserSOGLink_pkey" PRIMARY KEY ("userId", "sogIdentityId")
);

-- CreateTable
CREATE TABLE "ListSharedWith" (
	"userId" TEXT NOT NULL,
	"listId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ListSharedWith_pkey" PRIMARY KEY ("userId", "listId")
);

-- CreateTable
CREATE TABLE "SavedOrganization" (
	"listId" TEXT NOT NULL,
	"organizationId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "SavedOrganization_pkey" PRIMARY KEY ("listId", "organizationId")
);

-- CreateTable
CREATE TABLE "SavedService" (
	"listId" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "SavedService_pkey" PRIMARY KEY ("listId", "serviceId")
);

-- CreateTable
CREATE TABLE "AssignedRole" (
	"userId" TEXT NOT NULL,
	"roleId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "AssignedRole_pkey" PRIMARY KEY ("userId", "roleId")
);

-- CreateTable
CREATE TABLE "SurveyCommunity" (
	"surveyId" TEXT NOT NULL,
	"communityId" TEXT NOT NULL,
	CONSTRAINT "SurveyCommunity_pkey" PRIMARY KEY ("surveyId", "communityId")
);

-- CreateTable
CREATE TABLE "SurveyEthnicity" (
	"surveyId" TEXT NOT NULL,
	"ethnicityId" TEXT NOT NULL,
	CONSTRAINT "SurveyEthnicity_pkey" PRIMARY KEY ("surveyId", "ethnicityId")
);

-- CreateTable
CREATE TABLE "SurveySOG" (
	"surveyId" TEXT NOT NULL,
	"sogId" TEXT NOT NULL,
	CONSTRAINT "SurveySOG_pkey" PRIMARY KEY ("surveyId", "sogId")
);

-- CreateTable
CREATE TABLE "OrgWebsiteLanguage" (
	"orgWebsiteId" TEXT NOT NULL,
	"languageId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgWebsiteLanguage_pkey" PRIMARY KEY ("orgWebsiteId", "languageId")
);

-- CreateTable
CREATE TABLE "OrgPhoneLanguage" (
	"orgPhoneId" TEXT NOT NULL,
	"languageId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgPhoneLanguage_pkey" PRIMARY KEY ("orgPhoneId", "languageId")
);

-- CreateTable
CREATE TABLE "OrgServicePhone" (
	"orgPhoneId" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgServicePhone_pkey" PRIMARY KEY ("orgPhoneId", "serviceId")
);

-- CreateTable
CREATE TABLE "OrgServiceEmail" (
	"orgEmailId" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgServiceEmail_pkey" PRIMARY KEY ("orgEmailId", "serviceId")
);

-- CreateTable
CREATE TABLE "OrgLocationEmail" (
	"orgLocationId" TEXT NOT NULL,
	"orgEmailId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgLocationEmail_pkey" PRIMARY KEY ("orgEmailId", "orgLocationId")
);

-- CreateTable
CREATE TABLE "OrgLocationPhone" (
	"orgLocationId" TEXT NOT NULL,
	"phoneId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgLocationPhone_pkey" PRIMARY KEY ("orgLocationId", "phoneId")
);

-- CreateTable
CREATE TABLE "OrgLocationService" (
	"orgLocationId" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgLocationService_pkey" PRIMARY KEY ("orgLocationId", "serviceId")
);

-- CreateTable
CREATE TABLE "OrgServiceTag" (
	"serviceId" TEXT NOT NULL,
	"tagId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrgServiceTag_pkey" PRIMARY KEY ("serviceId", "tagId")
);

-- CreateTable
CREATE TABLE "ServiceAreaCountry" (
	"serviceAreaId" TEXT NOT NULL,
	"countryId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceAreaCountry_pkey" PRIMARY KEY ("serviceAreaId", "countryId")
);

-- CreateTable
CREATE TABLE "ServiceAreaDist" (
	"serviceAreaId" TEXT NOT NULL,
	"govDistId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceAreaDist_pkey" PRIMARY KEY ("serviceAreaId", "govDistId")
);

-- CreateTable
CREATE TABLE "OrganizationAttribute" (
	"organizationId" TEXT NOT NULL,
	"attributeId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrganizationAttribute_pkey" PRIMARY KEY ("organizationId", "attributeId")
);

-- CreateTable
CREATE TABLE "LocationAttribute" (
	"locationId" TEXT NOT NULL,
	"attributeId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "LocationAttribute_pkey" PRIMARY KEY ("locationId", "attributeId")
);

-- CreateTable
CREATE TABLE "ServiceAttribute" (
	"orgServiceId" TEXT NOT NULL,
	"attributeId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceAttribute_pkey" PRIMARY KEY ("orgServiceId", "attributeId")
);

-- CreateTable
CREATE TABLE "ServiceAccessAttribute" (
	"serviceAccessId" TEXT NOT NULL,
	"attributeId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceAccessAttribute_pkey" PRIMARY KEY ("serviceAccessId", "attributeId")
);

-- CreateTable
CREATE TABLE "AttributeToCategory" (
	"attributeId" TEXT NOT NULL,
	"categoryId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "AttributeToCategory_pkey" PRIMARY KEY ("attributeId", "categoryId")
);

-- CreateTable
CREATE TABLE "ServiceCategoryDefaultAttribute" (
	"attributeId" TEXT NOT NULL,
	"categoryId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceCategoryDefaultAttribute_pkey" PRIMARY KEY ("attributeId", "categoryId")
);

-- CreateTable
CREATE TABLE "ServiceTagDefaultAttribute" (
	"attributeId" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceTagDefaultAttribute_pkey" PRIMARY KEY ("attributeId", "serviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_legacyId_key" ON "User"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_tag_key" ON "UserRole"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_type_key" ON "UserType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_tsKey_tsNs_key" ON "UserType"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "UserTitle_title_key" ON "UserTitle"("title");

-- CreateIndex
CREATE UNIQUE INDEX "UserTitle_tsKey_tsNs_key" ON "UserTitle"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "UserEthnicity_ethnicity_key" ON "UserEthnicity"("ethnicity");

-- CreateIndex
CREATE UNIQUE INDEX "UserEthnicity_tsKey_tsNs_key" ON "UserEthnicity"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "UserImmigration_status_key" ON "UserImmigration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserImmigration_tsKey_tsNs_key" ON "UserImmigration"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "UserSOGIdentity_identifyAs_key" ON "UserSOGIdentity"("identifyAs");

-- CreateIndex
CREATE UNIQUE INDEX "UserSOGIdentity_tsKey_tsNs_key" ON "UserSOGIdentity"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunity_community_key" ON "UserCommunity"("community");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunity_tsKey_tsNs_key" ON "UserCommunity"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedList_sharedLinkKey_key" ON "UserSavedList"("sharedLinkKey");

-- CreateIndex
CREATE INDEX "UserSavedList_ownedById_idx" ON "UserSavedList"("ownedById");

-- CreateIndex
CREATE INDEX "UserSavedList_sharedLinkKey_idx" ON "UserSavedList"("sharedLinkKey");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_legacyId_key" ON "Organization"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_descriptionId_key" ON "Organization"("descriptionId");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OrgEmail_legacyId_key" ON "OrgEmail"("legacyId");

-- CreateIndex
CREATE INDEX "OrgEmail_lastName_firstName_idx" ON "OrgEmail"("lastName" ASC, "firstName");

-- CreateIndex
CREATE INDEX "OrgEmail_email_idx" ON "OrgEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrgPhone_legacyId_key" ON "OrgPhone"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgSocialMedia_legacyId_key" ON "OrgSocialMedia"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgWebsite_descriptionId_key" ON "OrgWebsite"("descriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgLocation_legacyId_key" ON "OrgLocation"("legacyId");

-- CreateIndex
CREATE INDEX "OrgLocation_geo_idx" ON "OrgLocation" USING SPGIST ("geo");

-- CreateIndex
CREATE INDEX "OrgLocation_latitude_longitude_idx" ON "OrgLocation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "OrgLocation_geoJSON_idx" ON "OrgLocation" USING GIN ("geoJSON" jsonb_path_ops);

-- CreateIndex
CREATE UNIQUE INDEX "FreeText_key_ns_key" ON "FreeText"("key", "ns");

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_legacyId_key" ON "OrgService"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_descriptionId_key" ON "OrgService"("descriptionId");

-- CreateIndex
CREATE INDEX "OrgService_organizationId_idx" ON "OrgService"("organizationId" ASC);

-- CreateIndex
CREATE INDEX "OrgService_descriptionId_idx" ON "OrgService"("descriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_organizationId_key" ON "ServiceArea"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_orgLocationId_key" ON "ServiceArea"("orgLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_orgServiceId_key" ON "ServiceArea"("orgServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgReview_legacyId_key" ON "OrgReview"("legacyId");

-- CreateIndex
CREATE INDEX "OrgReview_organizationId_idx" ON "OrgReview"("organizationId" ASC);

-- CreateIndex
CREATE INDEX "OrgReview_orgServiceId_idx" ON "OrgReview"("orgServiceId" ASC);

-- CreateIndex
CREATE INDEX "TranslatedReview_reviewId_idx" ON "TranslatedReview"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_tag_key" ON "AttributeCategory"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_name_key" ON "AttributeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_tag_key" ON "Attribute"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "Attribute"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_tsKey_tsNs_key" ON "Attribute"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeSupplement_textId_key" ON "AttributeSupplement"("textId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_locationAttributeAttributeId_locationAt_idx" ON "AttributeSupplement"(
	"locationAttributeAttributeId",
	"locationAttributeLocationId"
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationAttributeAttributeId_organi_idx" ON "AttributeSupplement"(
	"organizationAttributeAttributeId",
	"organizationAttributeOrganizationId"
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx" ON "AttributeSupplement"(
	"serviceAccessAttributeAttributeId",
	"serviceAccessAttributeServiceAccessId"
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAttributeAttributeId_serviceAttr_idx" ON "AttributeSupplement"(
	"serviceAttributeAttributeId",
	"serviceAttributeOrgServiceId"
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_category_key" ON "ServiceCategory"("category");

-- CreateIndex
CREATE INDEX "ServiceCategory_tsKey_tsNs_idx" ON "ServiceCategory"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_tsKey_tsNs_key" ON "ServiceCategory"("tsKey", "tsNs");

-- CreateIndex
CREATE INDEX "ServiceTag_tsKey_tsNs_idx" ON "ServiceTag"("tsKey", "tsNs");

-- CreateIndex
CREATE INDEX "ServiceTag_categoryId_idx" ON "ServiceTag"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_tsKey_tsNs_key" ON "ServiceTag"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_name_categoryId_key" ON "ServiceTag"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneType_type_key" ON "PhoneType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneType_tsKey_tsNs_key" ON "PhoneType"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaService_name_key" ON "SocialMediaService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaService_tsKey_tsNs_key" ON "SocialMediaService"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "Source_source_key" ON "Source"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca2_key" ON "Country"("cca2");

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca3_key" ON "Country"("cca3");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name" ASC);

-- CreateIndex
CREATE INDEX "Country_geo_idx" ON "Country" USING SPGIST ("geo");

-- CreateIndex
CREATE UNIQUE INDEX "Country_tsKey_tsNs_key" ON "Country"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "Country_demonymKey_demonymNs_key" ON "Country"("demonymKey", "demonymNs");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_slug_key" ON "GovDist"("slug");

-- CreateIndex
CREATE INDEX "GovDist_geo_idx" ON "GovDist" USING SPGIST ("geo");

-- CreateIndex
CREATE INDEX "GovDist_countryId_idx" ON "GovDist"("countryId");

-- CreateIndex
CREATE INDEX "GovDist_parentId_idx" ON "GovDist"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_tsKey_tsNs_key" ON "GovDist"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "GovDistType_name_key" ON "GovDistType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GovDistType_tsKey_tsNs_key" ON "GovDistType"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "Language_localeCode_key" ON "Language"("localeCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_tsKey_tsNs_key" ON "Navigation"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_display_href_key" ON "Navigation"("display", "href");

-- CreateIndex
CREATE UNIQUE INDEX "FooterLink_tsKey_tsNs_key" ON "FooterLink"("tsKey", "tsNs");

-- CreateIndex
CREATE UNIQUE INDEX "FooterLink_display_href_key" ON "FooterLink"("display", "href");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaLink_href_key" ON "SocialMediaLink"("href");

-- CreateIndex
CREATE UNIQUE INDEX "InternalNote_legacyId_key" ON "InternalNote"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToOrganization_orgEmailId_key" ON "UserToOrganization"("orgEmailId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToOrganization_orgPhoneId_key" ON "UserToOrganization"("orgPhoneId");

-- AddForeignKey
ALTER TABLE
	"Account"
ADD
	CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Session"
ADD
	CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"User"
ADD
	CONSTRAINT "User_currentGovDistId_fkey" FOREIGN KEY ("currentGovDistId") REFERENCES "GovDist"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"User"
ADD
	CONSTRAINT "User_currentCountryId_fkey" FOREIGN KEY ("currentCountryId") REFERENCES "Country"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"User"
ADD
	CONSTRAINT "User_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"User"
ADD
	CONSTRAINT "User_langPrefId_fkey" FOREIGN KEY ("langPrefId") REFERENCES "Language"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"User"
ADD
	CONSTRAINT "User_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserType"
ADD
	CONSTRAINT "UserType_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserTitle"
ADD
	CONSTRAINT "UserTitle_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSurvey"
ADD
	CONSTRAINT "UserSurvey_countryOriginId_fkey" FOREIGN KEY ("countryOriginId") REFERENCES "Country"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSurvey"
ADD
	CONSTRAINT "UserSurvey_immigrationId_fkey" FOREIGN KEY ("immigrationId") REFERENCES "UserImmigration"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSurvey"
ADD
	CONSTRAINT "UserSurvey_currentGovDistId_fkey" FOREIGN KEY ("currentGovDistId") REFERENCES "GovDist"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSurvey"
ADD
	CONSTRAINT "UserSurvey_currentCountryId_fkey" FOREIGN KEY ("currentCountryId") REFERENCES "Country"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserEthnicity"
ADD
	CONSTRAINT "UserEthnicity_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserImmigration"
ADD
	CONSTRAINT "UserImmigration_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSOGIdentity"
ADD
	CONSTRAINT "UserSOGIdentity_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserCommunity"
ADD
	CONSTRAINT "UserCommunity_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSavedList"
ADD
	CONSTRAINT "UserSavedList_ownedById_fkey" FOREIGN KEY ("ownedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserMail"
ADD
	CONSTRAINT "UserMail_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserMail"
ADD
	CONSTRAINT "UserMail_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserMail"
ADD
	CONSTRAINT "UserMail_responseToId_fkey" FOREIGN KEY ("responseToId") REFERENCES "UserMail"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Organization"
ADD
	CONSTRAINT "Organization_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "FreeText"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Organization"
ADD
	CONSTRAINT "Organization_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgEmail"
ADD
	CONSTRAINT "OrgEmail_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "UserTitle"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgEmail"
ADD
	CONSTRAINT "OrgEmail_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgPhone"
ADD
	CONSTRAINT "OrgPhone_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgPhone"
ADD
	CONSTRAINT "OrgPhone_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgPhone"
ADD
	CONSTRAINT "OrgPhone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgSocialMedia"
ADD
	CONSTRAINT "OrgSocialMedia_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgSocialMedia"
ADD
	CONSTRAINT "OrgSocialMedia_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgSocialMedia"
ADD
	CONSTRAINT "OrgSocialMedia_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgWebsite"
ADD
	CONSTRAINT "OrgWebsite_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "FreeText"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgWebsite"
ADD
	CONSTRAINT "OrgWebsite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgWebsite"
ADD
	CONSTRAINT "OrgWebsite_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocation"
ADD
	CONSTRAINT "OrgLocation_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocation"
ADD
	CONSTRAINT "OrgLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocation"
ADD
	CONSTRAINT "OrgLocation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgPhoto"
ADD
	CONSTRAINT "OrgPhoto_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgPhoto"
ADD
	CONSTRAINT "OrgPhoto_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgHours"
ADD
	CONSTRAINT "OrgHours_orgLocId_fkey" FOREIGN KEY ("orgLocId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgHours"
ADD
	CONSTRAINT "OrgHours_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgHours"
ADD
	CONSTRAINT "OrgHours_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"FreeText"
ADD
	CONSTRAINT "FreeText_key_ns_fkey" FOREIGN KEY ("key", "ns") REFERENCES "TranslationKey"("key", "ns") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgService"
ADD
	CONSTRAINT "OrgService_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "FreeText"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgService"
ADD
	CONSTRAINT "OrgService_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceArea"
ADD
	CONSTRAINT "ServiceArea_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceArea"
ADD
	CONSTRAINT "ServiceArea_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceArea"
ADD
	CONSTRAINT "ServiceArea_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAccess"
ADD
	CONSTRAINT "ServiceAccess_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgReview"
ADD
	CONSTRAINT "OrgReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgReview"
ADD
	CONSTRAINT "OrgReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgReview"
ADD
	CONSTRAINT "OrgReview_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgReview"
ADD
	CONSTRAINT "OrgReview_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgReview"
ADD
	CONSTRAINT "OrgReview_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgReview"
ADD
	CONSTRAINT "OrgReview_lcrGovDistId_fkey" FOREIGN KEY ("lcrGovDistId") REFERENCES "GovDist"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgReview"
ADD
	CONSTRAINT "OrgReview_lcrCountryId_fkey" FOREIGN KEY ("lcrCountryId") REFERENCES "Country"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"TranslatedReview"
ADD
	CONSTRAINT "TranslatedReview_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "OrgReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"TranslatedReview"
ADD
	CONSTRAINT "TranslatedReview_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeCategory"
ADD
	CONSTRAINT "AttributeCategory_ns_fkey" FOREIGN KEY ("ns") REFERENCES "TranslationNamespace"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Attribute"
ADD
	CONSTRAINT "Attribute_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_textId_fkey" FOREIGN KEY ("textId") REFERENCES "FreeText"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_locationAttributeAttributeId_locationA_fkey" FOREIGN KEY (
		"locationAttributeAttributeId",
		"locationAttributeLocationId"
	) REFERENCES "LocationAttribute"("attributeId", "locationId") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_organizationAttributeAttributeId_organ_fkey" FOREIGN KEY (
		"organizationAttributeAttributeId",
		"organizationAttributeOrganizationId"
	) REFERENCES "OrganizationAttribute"("attributeId", "organizationId") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_serviceAccessAttributeAttributeId_serv_fkey" FOREIGN KEY (
		"serviceAccessAttributeAttributeId",
		"serviceAccessAttributeServiceAccessId"
	) REFERENCES "ServiceAccessAttribute"("attributeId", "serviceAccessId") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_serviceAttributeAttributeId_serviceAtt_fkey" FOREIGN KEY (
		"serviceAttributeAttributeId",
		"serviceAttributeOrgServiceId"
	) REFERENCES "ServiceAttribute"("attributeId", "orgServiceId") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceCategory"
ADD
	CONSTRAINT "ServiceCategory_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceTag"
ADD
	CONSTRAINT "ServiceTag_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceTag"
ADD
	CONSTRAINT "ServiceTag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"PhoneType"
ADD
	CONSTRAINT "PhoneType_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SocialMediaService"
ADD
	CONSTRAINT "SocialMediaService_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Country"
ADD
	CONSTRAINT "Country_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Country"
ADD
	CONSTRAINT "Country_demonymKey_demonymNs_fkey" FOREIGN KEY ("demonymKey", "demonymNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"GovDist"
ADD
	CONSTRAINT "GovDist_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"GovDist"
ADD
	CONSTRAINT "GovDist_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "GovDistType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"GovDist"
ADD
	CONSTRAINT "GovDist_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GovDist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"GovDist"
ADD
	CONSTRAINT "GovDist_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"GovDistType"
ADD
	CONSTRAINT "GovDistType_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"TranslationKey"
ADD
	CONSTRAINT "TranslationKey_ns_fkey" FOREIGN KEY ("ns") REFERENCES "TranslationNamespace"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OutsideAPI"
ADD
	CONSTRAINT "OutsideAPI_serviceName_fkey" FOREIGN KEY ("serviceName") REFERENCES "OutsideAPIService"("service") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OutsideAPI"
ADD
	CONSTRAINT "OutsideAPI_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OutsideAPI"
ADD
	CONSTRAINT "OutsideAPI_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"FieldVisibility"
ADD
	CONSTRAINT "FieldVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Navigation"
ADD
	CONSTRAINT "Navigation_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"Navigation"
ADD
	CONSTRAINT "Navigation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Navigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"FooterLink"
ADD
	CONSTRAINT "FooterLink_tsKey_tsNs_fkey" FOREIGN KEY ("tsKey", "tsNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SocialMediaLink"
ADD
	CONSTRAINT "SocialMediaLink_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_attributeCategoryId_fkey" FOREIGN KEY ("attributeCategoryId") REFERENCES "AttributeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_attributeSupplementId_fkey" FOREIGN KEY ("attributeSupplementId") REFERENCES "AttributeSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_footerLinkId_fkey" FOREIGN KEY ("footerLinkId") REFERENCES "FooterLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "GovDistType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "Navigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgHoursId_fkey" FOREIGN KEY ("orgHoursId") REFERENCES "OrgHours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgPhotoId_fkey" FOREIGN KEY ("orgPhotoId") REFERENCES "OrgPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgReviewId_fkey" FOREIGN KEY ("orgReviewId") REFERENCES "OrgReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgSocialMediaId_fkey" FOREIGN KEY ("orgSocialMediaId") REFERENCES "OrgSocialMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_orgWebsiteId_fkey" FOREIGN KEY ("orgWebsiteId") REFERENCES "OrgWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "OutsideAPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_outsideAPIServiceService_fkey" FOREIGN KEY ("outsideAPIServiceService") REFERENCES "OutsideAPIService"("service") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_serviceAccessId_fkey" FOREIGN KEY ("serviceAccessId") REFERENCES "ServiceAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_socialMediaLinkId_fkey" FOREIGN KEY ("socialMediaLinkId") REFERENCES "SocialMediaLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_socialMediaServiceId_fkey" FOREIGN KEY ("socialMediaServiceId") REFERENCES "SocialMediaService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_translationKey_translationNs_fkey" FOREIGN KEY ("translationKey", "translationNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"InternalNote"
ADD
	CONSTRAINT "InternalNote_translationNamespaceName_fkey" FOREIGN KEY ("translationNamespaceName") REFERENCES "TranslationNamespace"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_attributeCategoryId_fkey" FOREIGN KEY ("attributeCategoryId") REFERENCES "AttributeCategory"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_attributeSupplementId_fkey" FOREIGN KEY ("attributeSupplementId") REFERENCES "AttributeSupplement"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_fieldVisibilityId_fkey" FOREIGN KEY ("fieldVisibilityId") REFERENCES "FieldVisibility"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_footerLinkId_fkey" FOREIGN KEY ("footerLinkId") REFERENCES "FooterLink"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_freeTextId_fkey" FOREIGN KEY ("freeTextId") REFERENCES "FreeText"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "GovDistType"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_internalNoteId_fkey" FOREIGN KEY ("internalNoteId") REFERENCES "InternalNote"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_locationPermissionUserId_locationPermissionPermis_fkey" FOREIGN KEY (
		"locationPermissionUserId",
		"locationPermissionPermissionId",
		"locationPermissionOrgLocationId"
	) REFERENCES "LocationPermission"("userId", "permissionId", "orgLocationId") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "Navigation"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_organizationPermissionUserId_organizationPermissi_fkey" FOREIGN KEY (
		"organizationPermissionUserId",
		"organizationPermissionPermissionId",
		"organizationPermissionOrganizationId"
	) REFERENCES "OrganizationPermission"("userId", "permissionId", "organizationId") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgHoursId_fkey" FOREIGN KEY ("orgHoursId") REFERENCES "OrgHours"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgPhotoId_fkey" FOREIGN KEY ("orgPhotoId") REFERENCES "OrgPhoto"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgReviewId_fkey" FOREIGN KEY ("orgReviewId") REFERENCES "OrgReview"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgSocialMediaId_fkey" FOREIGN KEY ("orgSocialMediaId") REFERENCES "OrgSocialMedia"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_orgWebsiteId_fkey" FOREIGN KEY ("orgWebsiteId") REFERENCES "OrgWebsite"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_outsideAPIId_fkey" FOREIGN KEY ("outsideAPIId") REFERENCES "OutsideAPI"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_outsideAPIServiceService_fkey" FOREIGN KEY ("outsideAPIServiceService") REFERENCES "OutsideAPIService"("service") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_serviceAccessId_fkey" FOREIGN KEY ("serviceAccessId") REFERENCES "ServiceAccess"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_socialMediaLinkId_fkey" FOREIGN KEY ("socialMediaLinkId") REFERENCES "SocialMediaLink"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_socialMediaServiceId_fkey" FOREIGN KEY ("socialMediaServiceId") REFERENCES "SocialMediaService"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_translatedReviewId_fkey" FOREIGN KEY ("translatedReviewId") REFERENCES "TranslatedReview"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_translationKey_translationNs_fkey" FOREIGN KEY ("translationKey", "translationNs") REFERENCES "TranslationKey"("key", "ns") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_translationNamespaceName_fkey" FOREIGN KEY ("translationNamespaceName") REFERENCES "TranslationNamespace"("name") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userCommunityId_fkey" FOREIGN KEY ("userCommunityId") REFERENCES "UserCommunity"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userEthnicityId_fkey" FOREIGN KEY ("userEthnicityId") REFERENCES "UserEthnicity"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userImmigrationId_fkey" FOREIGN KEY ("userImmigrationId") REFERENCES "UserImmigration"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userMailId_fkey" FOREIGN KEY ("userMailId") REFERENCES "UserMail"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "UserRole"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userSavedListId_fkey" FOREIGN KEY ("userSavedListId") REFERENCES "UserSavedList"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userSOGIdentityId_fkey" FOREIGN KEY ("userSOGIdentityId") REFERENCES "UserSOGIdentity"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userTitleId_fkey" FOREIGN KEY ("userTitleId") REFERENCES "UserTitle"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AuditLog"
ADD
	CONSTRAINT "AuditLog_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserPermission"
ADD
	CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserPermission"
ADD
	CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"RolePermission"
ADD
	CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"RolePermission"
ADD
	CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserToOrganization"
ADD
	CONSTRAINT "UserToOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserToOrganization"
ADD
	CONSTRAINT "UserToOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserToOrganization"
ADD
	CONSTRAINT "UserToOrganization_orgTitleId_fkey" FOREIGN KEY ("orgTitleId") REFERENCES "UserTitle"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserToOrganization"
ADD
	CONSTRAINT "UserToOrganization_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserToOrganization"
ADD
	CONSTRAINT "UserToOrganization_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationPermission"
ADD
	CONSTRAINT "OrganizationPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationPermission"
ADD
	CONSTRAINT "OrganizationPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationPermission"
ADD
	CONSTRAINT "OrganizationPermission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"LocationPermission"
ADD
	CONSTRAINT "LocationPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"LocationPermission"
ADD
	CONSTRAINT "LocationPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"LocationPermission"
ADD
	CONSTRAINT "LocationPermission_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserCommunityLink"
ADD
	CONSTRAINT "UserCommunityLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserCommunityLink"
ADD
	CONSTRAINT "UserCommunityLink_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "UserCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSOGLink"
ADD
	CONSTRAINT "UserSOGLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"UserSOGLink"
ADD
	CONSTRAINT "UserSOGLink_sogIdentityId_fkey" FOREIGN KEY ("sogIdentityId") REFERENCES "UserSOGIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ListSharedWith"
ADD
	CONSTRAINT "ListSharedWith_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ListSharedWith"
ADD
	CONSTRAINT "ListSharedWith_listId_fkey" FOREIGN KEY ("listId") REFERENCES "UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SavedOrganization"
ADD
	CONSTRAINT "SavedOrganization_listId_fkey" FOREIGN KEY ("listId") REFERENCES "UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SavedOrganization"
ADD
	CONSTRAINT "SavedOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SavedService"
ADD
	CONSTRAINT "SavedService_listId_fkey" FOREIGN KEY ("listId") REFERENCES "UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SavedService"
ADD
	CONSTRAINT "SavedService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AssignedRole"
ADD
	CONSTRAINT "AssignedRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AssignedRole"
ADD
	CONSTRAINT "AssignedRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SurveyCommunity"
ADD
	CONSTRAINT "SurveyCommunity_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "UserSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SurveyCommunity"
ADD
	CONSTRAINT "SurveyCommunity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "UserCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SurveyEthnicity"
ADD
	CONSTRAINT "SurveyEthnicity_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "UserSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SurveyEthnicity"
ADD
	CONSTRAINT "SurveyEthnicity_ethnicityId_fkey" FOREIGN KEY ("ethnicityId") REFERENCES "UserEthnicity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SurveySOG"
ADD
	CONSTRAINT "SurveySOG_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "UserSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"SurveySOG"
ADD
	CONSTRAINT "SurveySOG_sogId_fkey" FOREIGN KEY ("sogId") REFERENCES "UserSOGIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgWebsiteLanguage"
ADD
	CONSTRAINT "OrgWebsiteLanguage_orgWebsiteId_fkey" FOREIGN KEY ("orgWebsiteId") REFERENCES "OrgWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgWebsiteLanguage"
ADD
	CONSTRAINT "OrgWebsiteLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgPhoneLanguage"
ADD
	CONSTRAINT "OrgPhoneLanguage_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgPhoneLanguage"
ADD
	CONSTRAINT "OrgPhoneLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgServicePhone"
ADD
	CONSTRAINT "OrgServicePhone_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgServicePhone"
ADD
	CONSTRAINT "OrgServicePhone_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgServiceEmail"
ADD
	CONSTRAINT "OrgServiceEmail_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgServiceEmail"
ADD
	CONSTRAINT "OrgServiceEmail_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocationEmail"
ADD
	CONSTRAINT "OrgLocationEmail_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocationEmail"
ADD
	CONSTRAINT "OrgLocationEmail_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocationPhone"
ADD
	CONSTRAINT "OrgLocationPhone_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocationPhone"
ADD
	CONSTRAINT "OrgLocationPhone_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "OrgPhone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocationService"
ADD
	CONSTRAINT "OrgLocationService_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgLocationService"
ADD
	CONSTRAINT "OrgLocationService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgServiceTag"
ADD
	CONSTRAINT "OrgServiceTag_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrgServiceTag"
ADD
	CONSTRAINT "OrgServiceTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAreaCountry"
ADD
	CONSTRAINT "ServiceAreaCountry_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAreaCountry"
ADD
	CONSTRAINT "ServiceAreaCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAreaDist"
ADD
	CONSTRAINT "ServiceAreaDist_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAreaDist"
ADD
	CONSTRAINT "ServiceAreaDist_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationAttribute"
ADD
	CONSTRAINT "OrganizationAttribute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationAttribute"
ADD
	CONSTRAINT "OrganizationAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"LocationAttribute"
ADD
	CONSTRAINT "LocationAttribute_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"LocationAttribute"
ADD
	CONSTRAINT "LocationAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAttribute"
ADD
	CONSTRAINT "ServiceAttribute_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAttribute"
ADD
	CONSTRAINT "ServiceAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAccessAttribute"
ADD
	CONSTRAINT "ServiceAccessAttribute_serviceAccessId_fkey" FOREIGN KEY ("serviceAccessId") REFERENCES "ServiceAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceAccessAttribute"
ADD
	CONSTRAINT "ServiceAccessAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeToCategory"
ADD
	CONSTRAINT "AttributeToCategory_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"AttributeToCategory"
ADD
	CONSTRAINT "AttributeToCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AttributeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceCategoryDefaultAttribute"
ADD
	CONSTRAINT "ServiceCategoryDefaultAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceCategoryDefaultAttribute"
ADD
	CONSTRAINT "ServiceCategoryDefaultAttribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceTagDefaultAttribute"
ADD
	CONSTRAINT "ServiceTagDefaultAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceTagDefaultAttribute"
ADD
	CONSTRAINT "ServiceTagDefaultAttribute_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;



	-- CUSTOM ADDITIONS

	-- Add check constraint to make sure one of the required records is linked.
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_check_linked_records" CHECK (
		(
			"locationAttributeAttributeId" IS NOT NULL
			AND "locationAttributeLocationId" IS NOT NULL
		) :: int + (
			"organizationAttributeAttributeId" IS NOT NULL
			AND "organizationAttributeOrganizationId" IS NOT NULL
		) :: int + (
			"serviceAccessAttributeAttributeId" IS NOT NULL
			AND "serviceAccessAttributeServiceAccessId" IS NOT NULL
		) :: int + (
			"serviceAttributeAttributeId" IS NOT NULL
			AND "serviceAttributeOrgServiceId" IS NOT NULL
		) :: int = 1
	);
