-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "org";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "system";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "user"."UserSavedListVisibility" AS ENUM ('PRIVATE', 'SHARED_USER', 'SHARED_LINK', 'PUBLIC');

-- CreateEnum
CREATE TYPE "system"."SourceType" AS ENUM ('EXTERNAL', 'ORGANIZATION', 'SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "user"."VisibilitySetting" AS ENUM ('NONE', 'LOGGED_IN', 'PROVIDER', 'PUBLIC');

-- CreateTable
CREATE TABLE "user"."Account" (
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
CREATE TABLE "user"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "legacyId" TEXT,
    "birthYear" SMALLINT,
    "reasonForJoin" TEXT,
    "currentCity" TEXT,
    "currentGovDistId" TEXT,
    "currentCountryId" TEXT,
    "legacyHash" TEXT,
    "legacySalt" TEXT,
    "migrateDate" TIMESTAMP(3),
    "immigrationId" TEXT,
    "roleId" TEXT NOT NULL,
    "userTypeId" TEXT NOT NULL,
    "langPrefId" TEXT NOT NULL,
    "sourceId" TEXT,
    "associatedOrgId" TEXT,
    "orgTitleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."PermissionAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."PermissionItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserTitle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "searchable" BOOLEAN NOT NULL DEFAULT false,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserEthnicity" (
    "id" TEXT NOT NULL,
    "ethnicity" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEthnicity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserImmigration" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserImmigration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserSOGIdentity" (
    "id" TEXT NOT NULL,
    "identifyAs" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSOGIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserCommunity" (
    "id" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserSavedList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visibility" "user"."UserSavedListVisibility" NOT NULL DEFAULT 'PRIVATE',
    "sharedLinkKey" TEXT,
    "ownedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSavedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserMail" (
    "id" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "from" TEXT,
    "fromUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."Organization" (
    "id" TEXT NOT NULL,
    "legacyId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "lastVerified" TIMESTAMP(3),
    "outsideApiId" TEXT,
    "apiIdentifier" TEXT,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgDescription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgEmail" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "email" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "titleId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "orgLocationId" TEXT,
    "orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgPhone" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "countryId" TEXT NOT NULL,
    "phoneTypeId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "orgLocationId" TEXT,
    "orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgSocialMedia" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orgLocationId" TEXT,
    "orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgSocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "street1" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "postCode" TEXT,
    "govDistId" TEXT,
    "countryId" TEXT NOT NULL,
    "longitude" DECIMAL(4,3) NOT NULL,
    "latitude" DECIMAL(4,3) NOT NULL,
    "geoJSON" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "orgId" TEXT NOT NULL,
    "outsideApiId" TEXT,
    "apiLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgPhoto" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "height" SMALLINT,
    "width" SMALLINT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "orgId" TEXT,
    "orgLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgHours" (
    "id" TEXT NOT NULL,
    "dayIndex" SMALLINT NOT NULL DEFAULT 0,
    "start" TIME(0) NOT NULL,
    "end" TIME(0) NOT NULL,
    "orgLocId" TEXT,
    "orgServiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgService" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" TEXT NOT NULL,
    "organizationId" TEXT,
    "orgLocationId" TEXT,
    "accessKeyId" TEXT,
    "descKeyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."OrgReview" (
    "id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "reviewText" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "orgServiceId" TEXT,
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
CREATE TABLE "system"."AttributeCategory" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intDesc" TEXT,
    "namespaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Attribute" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intDesc" TEXT,
    "categoryId" TEXT NOT NULL,
    "keyId" TEXT,
    "requireText" BOOLEAN NOT NULL DEFAULT false,
    "requireLanguage" BOOLEAN NOT NULL DEFAULT false,
    "requireCountry" BOOLEAN NOT NULL DEFAULT false,
    "requireSupplemental" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."AttributeSupplement" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "attributeId" TEXT NOT NULL,
    "organizationId" TEXT,
    "serviceId" TEXT,
    "locationId" TEXT,
    "serviceTagId" TEXT,
    "serviceCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."ServiceCategory" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."ServiceTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."PhoneType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."SocialMediaService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "urlBase" TEXT NOT NULL,
    "logoIcon" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Source" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" "system"."SourceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Country" (
    "id" TEXT NOT NULL,
    "cca2" CHAR(2) NOT NULL,
    "cca3" CHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "dialCode" SMALLINT,
    "flag" TEXT NOT NULL,
    "geoJSON" JSONB,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."GovDist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iso" TEXT,
    "abbrev" TEXT,
    "geoJSON" JSONB,
    "countryId" TEXT NOT NULL,
    "govDistTypeId" TEXT NOT NULL,
    "isPrimary" BOOLEAN DEFAULT true,
    "parentId" TEXT,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovDist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."GovDistType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovDistType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Language" (
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
CREATE TABLE "system"."TranslationNamespace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationNamespace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."TranslationKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "context" TEXT,
    "namespaceId" TEXT NOT NULL,
    "ns" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."OutsideAPI" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urlPattern" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutsideAPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."FieldVisibility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "lastName" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "lastNameInit" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "email" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "image" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "ethnicity" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "countryOrigin" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "SOG" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "communities" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "currentCity" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "currentGovDist" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "currentCountry" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "userType" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "associatedOrg" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "orgTitle" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "createdAt" "user"."VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "recordCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordupdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Navigation" (
    "id" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "href" TEXT,
    "isParent" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "keyId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Navigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."FooterLink" (
    "id" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."SocialMediaLink" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."InternalNote" (
    "id" TEXT NOT NULL,
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
    "orgDescriptionId" TEXT,
    "orgEmailId" TEXT,
    "orgHoursId" TEXT,
    "orgLocationId" TEXT,
    "orgPhoneId" TEXT,
    "orgPhotoId" TEXT,
    "orgReviewId" TEXT,
    "orgServiceId" TEXT,
    "orgSocialMediaId" TEXT,
    "outsideApiId" TEXT,
    "phoneTypeId" TEXT,
    "serviceCategoryId" TEXT,
    "serviceTagId" TEXT,
    "socialMediaLinkId" TEXT,
    "socialMediaServiceId" TEXT,
    "sourceId" TEXT,
    "translationKeyId" TEXT,
    "translationNamespaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" JSONB NOT NULL,
    "to" JSONB NOT NULL,
    "table" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "accountId" TEXT,
    "attributeId" TEXT,
    "attributeCategoryId" TEXT,
    "attributeSupplementId" TEXT,
    "countryId" TEXT,
    "fieldVisibilityId" TEXT,
    "footerLinkId" TEXT,
    "govDistId" TEXT,
    "govDistTypeId" TEXT,
    "internalNoteId" TEXT,
    "languageId" TEXT,
    "navigationId" TEXT,
    "organizationId" TEXT,
    "orgDescriptionId" TEXT,
    "orgEmailId" TEXT,
    "orgHoursId" TEXT,
    "orgLocationId" TEXT,
    "orgPhoneId" TEXT,
    "orgPhotoId" TEXT,
    "orgReviewId" TEXT,
    "orgServiceId" TEXT,
    "orgSocialMediaId" TEXT,
    "outsideAPIId" TEXT,
    "permissionAssetId" TEXT,
    "permissionItemId" TEXT,
    "phoneTypeId" TEXT,
    "serviceCategoryId" TEXT,
    "serviceTagId" TEXT,
    "socialMediaLinkId" TEXT,
    "socialMediaServiceId" TEXT,
    "sourceId" TEXT,
    "translationKeyId" TEXT,
    "translationNamespaceId" TEXT,
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
CREATE TABLE "user"."_UserToUserEthnicity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user"."_UserToUserSOGIdentity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user"."_UserToUserCommunity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user"."_sharedLists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user"."_PermissionItemToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user"."_PermissionItemToUserRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "org"."_OrganizationToUserSavedList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "org"."_OrganizationToPermissionAsset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "org"."_OrgLocationToPermissionAsset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system"."_AttributeToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system"."_AttributeToOrgLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system"."_AttributeToOrgService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system"."_AttributeToServiceCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system"."_AttributeToServiceTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system"."_countryOrigin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system"."_AuditLogEntry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "user"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "user"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "user"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "user"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_legacyId_key" ON "user"."User"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "user"."UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_tag_key" ON "user"."UserRole"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionItem_name_key" ON "user"."PermissionItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_type_key" ON "user"."UserType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_keyId_key" ON "user"."UserType"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTitle_title_key" ON "user"."UserTitle"("title");

-- CreateIndex
CREATE UNIQUE INDEX "UserTitle_keyId_key" ON "user"."UserTitle"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEthnicity_ethnicity_key" ON "user"."UserEthnicity"("ethnicity");

-- CreateIndex
CREATE UNIQUE INDEX "UserEthnicity_keyId_key" ON "user"."UserEthnicity"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserImmigration_status_key" ON "user"."UserImmigration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserImmigration_keyId_key" ON "user"."UserImmigration"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSOGIdentity_identifyAs_key" ON "user"."UserSOGIdentity"("identifyAs");

-- CreateIndex
CREATE UNIQUE INDEX "UserSOGIdentity_keyId_key" ON "user"."UserSOGIdentity"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunity_community_key" ON "user"."UserCommunity"("community");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunity_keyId_key" ON "user"."UserCommunity"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedList_sharedLinkKey_key" ON "user"."UserSavedList"("sharedLinkKey");

-- CreateIndex
CREATE INDEX "UserSavedList_ownedById_idx" ON "user"."UserSavedList"("ownedById");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_legacyId_key" ON "org"."Organization"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "org"."Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "org"."Organization"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OrgDescription_orgId_key" ON "org"."OrgDescription"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgDescription_keyId_key" ON "org"."OrgDescription"("keyId");

-- CreateIndex
CREATE INDEX "OrgDescription_keyId_orgId_idx" ON "org"."OrgDescription"("keyId", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgEmail_userId_key" ON "org"."OrgEmail"("userId");

-- CreateIndex
CREATE INDEX "OrgEmail_lastName_firstName_idx" ON "org"."OrgEmail"("lastName" ASC, "firstName");

-- CreateIndex
CREATE INDEX "OrgEmail_email_idx" ON "org"."OrgEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrgPhone_userId_key" ON "org"."OrgPhone"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgLocation_orgId_key" ON "org"."OrgLocation"("orgId");

-- CreateIndex
CREATE INDEX "OrgLocation_latitude_longitude_idx" ON "org"."OrgLocation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "OrgLocation_geoJSON_idx" ON "org"."OrgLocation" USING GIN ("geoJSON" jsonb_path_ops);

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_accessKeyId_key" ON "org"."OrgService"("accessKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_descKeyId_key" ON "org"."OrgService"("descKeyId");

-- CreateIndex
CREATE INDEX "OrgService_organizationId_idx" ON "org"."OrgService"("organizationId" ASC);

-- CreateIndex
CREATE INDEX "OrgService_orgLocationId_idx" ON "org"."OrgService"("orgLocationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_serviceId_organizationId_key" ON "org"."OrgService"("serviceId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_serviceId_orgLocationId_key" ON "org"."OrgService"("serviceId", "orgLocationId");

-- CreateIndex
CREATE INDEX "OrgReview_organizationId_idx" ON "org"."OrgReview"("organizationId" ASC);

-- CreateIndex
CREATE INDEX "OrgReview_orgServiceId_idx" ON "org"."OrgReview"("orgServiceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_tag_key" ON "system"."AttributeCategory"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_name_key" ON "system"."AttributeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_tag_key" ON "system"."Attribute"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "system"."Attribute"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_categoryId_name_key" ON "system"."Attribute"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_category_key" ON "system"."ServiceCategory"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_keyId_key" ON "system"."ServiceCategory"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_keyId_key" ON "system"."ServiceTag"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_name_categoryId_key" ON "system"."ServiceTag"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneType_type_key" ON "system"."PhoneType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneType_keyId_key" ON "system"."PhoneType"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaService_name_key" ON "system"."SocialMediaService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaService_keyId_key" ON "system"."SocialMediaService"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_source_key" ON "system"."Source"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca2_key" ON "system"."Country"("cca2");

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca3_key" ON "system"."Country"("cca3");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "system"."Country"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Country_keyId_key" ON "system"."Country"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_slug_key" ON "system"."GovDist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_keyId_key" ON "system"."GovDist"("keyId");

-- CreateIndex
CREATE INDEX "GovDist_countryId_idx" ON "system"."GovDist"("countryId");

-- CreateIndex
CREATE INDEX "GovDist_parentId_idx" ON "system"."GovDist"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "GovDistType_name_key" ON "system"."GovDistType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GovDistType_keyId_key" ON "system"."GovDistType"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_localeCode_key" ON "system"."Language"("localeCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationNamespace_name_key" ON "system"."TranslationNamespace"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationNamespace_id_name_key" ON "system"."TranslationNamespace"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationKey_ns_key_key" ON "system"."TranslationKey"("ns" ASC, "key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OutsideAPI_name_key" ON "system"."OutsideAPI"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_keyId_key" ON "system"."Navigation"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_display_href_key" ON "system"."Navigation"("display", "href");

-- CreateIndex
CREATE UNIQUE INDEX "FooterLink_keyId_key" ON "system"."FooterLink"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "FooterLink_display_href_key" ON "system"."FooterLink"("display", "href");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaLink_href_key" ON "system"."SocialMediaLink"("href");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_timestamp_recordId_key" ON "system"."AuditLog"("timestamp", "recordId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserEthnicity_AB_unique" ON "user"."_UserToUserEthnicity"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserEthnicity_B_index" ON "user"."_UserToUserEthnicity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserSOGIdentity_AB_unique" ON "user"."_UserToUserSOGIdentity"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserSOGIdentity_B_index" ON "user"."_UserToUserSOGIdentity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserCommunity_AB_unique" ON "user"."_UserToUserCommunity"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserCommunity_B_index" ON "user"."_UserToUserCommunity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_sharedLists_AB_unique" ON "user"."_sharedLists"("A", "B");

-- CreateIndex
CREATE INDEX "_sharedLists_B_index" ON "user"."_sharedLists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionItemToUser_AB_unique" ON "user"."_PermissionItemToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionItemToUser_B_index" ON "user"."_PermissionItemToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionItemToUserRole_AB_unique" ON "user"."_PermissionItemToUserRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionItemToUserRole_B_index" ON "user"."_PermissionItemToUserRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToUserSavedList_AB_unique" ON "org"."_OrganizationToUserSavedList"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToUserSavedList_B_index" ON "org"."_OrganizationToUserSavedList"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToPermissionAsset_AB_unique" ON "org"."_OrganizationToPermissionAsset"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToPermissionAsset_B_index" ON "org"."_OrganizationToPermissionAsset"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgLocationToPermissionAsset_AB_unique" ON "org"."_OrgLocationToPermissionAsset"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgLocationToPermissionAsset_B_index" ON "org"."_OrgLocationToPermissionAsset"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrganization_AB_unique" ON "system"."_AttributeToOrganization"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrganization_B_index" ON "system"."_AttributeToOrganization"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrgLocation_AB_unique" ON "system"."_AttributeToOrgLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrgLocation_B_index" ON "system"."_AttributeToOrgLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrgService_AB_unique" ON "system"."_AttributeToOrgService"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrgService_B_index" ON "system"."_AttributeToOrgService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToServiceCategory_AB_unique" ON "system"."_AttributeToServiceCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToServiceCategory_B_index" ON "system"."_AttributeToServiceCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToServiceTag_AB_unique" ON "system"."_AttributeToServiceTag"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToServiceTag_B_index" ON "system"."_AttributeToServiceTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_countryOrigin_AB_unique" ON "system"."_countryOrigin"("A", "B");

-- CreateIndex
CREATE INDEX "_countryOrigin_B_index" ON "system"."_countryOrigin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AuditLogEntry_AB_unique" ON "system"."_AuditLogEntry"("A", "B");

-- CreateIndex
CREATE INDEX "_AuditLogEntry_B_index" ON "system"."_AuditLogEntry"("B");

-- AddForeignKey
ALTER TABLE "user"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_currentGovDistId_fkey" FOREIGN KEY ("currentGovDistId") REFERENCES "system"."GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_currentCountryId_fkey" FOREIGN KEY ("currentCountryId") REFERENCES "system"."Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_immigrationId_fkey" FOREIGN KEY ("immigrationId") REFERENCES "user"."UserImmigration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user"."UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "user"."UserType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_langPrefId_fkey" FOREIGN KEY ("langPrefId") REFERENCES "system"."Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "system"."Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_associatedOrgId_fkey" FOREIGN KEY ("associatedOrgId") REFERENCES "org"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."User" ADD CONSTRAINT "User_orgTitleId_fkey" FOREIGN KEY ("orgTitleId") REFERENCES "user"."UserTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."PermissionAsset" ADD CONSTRAINT "PermissionAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."PermissionAsset" ADD CONSTRAINT "PermissionAsset_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "user"."PermissionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserType" ADD CONSTRAINT "UserType_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserTitle" ADD CONSTRAINT "UserTitle_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserEthnicity" ADD CONSTRAINT "UserEthnicity_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserImmigration" ADD CONSTRAINT "UserImmigration_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserSOGIdentity" ADD CONSTRAINT "UserSOGIdentity_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserCommunity" ADD CONSTRAINT "UserCommunity_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserSavedList" ADD CONSTRAINT "UserSavedList_ownedById_fkey" FOREIGN KEY ("ownedById") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserMail" ADD CONSTRAINT "UserMail_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserMail" ADD CONSTRAINT "UserMail_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."Organization" ADD CONSTRAINT "Organization_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "system"."OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."Organization" ADD CONSTRAINT "Organization_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "system"."Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgDescription" ADD CONSTRAINT "OrgDescription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "org"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgDescription" ADD CONSTRAINT "OrgDescription_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgEmail" ADD CONSTRAINT "OrgEmail_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "user"."UserTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgEmail" ADD CONSTRAINT "OrgEmail_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "org"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgEmail" ADD CONSTRAINT "OrgEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgEmail" ADD CONSTRAINT "OrgEmail_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgPhone" ADD CONSTRAINT "OrgPhone_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "system"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgPhone" ADD CONSTRAINT "OrgPhone_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "system"."PhoneType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgPhone" ADD CONSTRAINT "OrgPhone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "org"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgPhone" ADD CONSTRAINT "OrgPhone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgPhone" ADD CONSTRAINT "OrgPhone_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "system"."SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "org"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgLocation" ADD CONSTRAINT "OrgLocation_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "system"."GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgLocation" ADD CONSTRAINT "OrgLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "system"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgLocation" ADD CONSTRAINT "OrgLocation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "org"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgLocation" ADD CONSTRAINT "OrgLocation_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "system"."OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgPhoto" ADD CONSTRAINT "OrgPhoto_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "org"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgPhoto" ADD CONSTRAINT "OrgPhoto_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgHours" ADD CONSTRAINT "OrgHours_orgLocId_fkey" FOREIGN KEY ("orgLocId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgHours" ADD CONSTRAINT "OrgHours_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "org"."OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgService" ADD CONSTRAINT "OrgService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "system"."ServiceTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgService" ADD CONSTRAINT "OrgService_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "org"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgService" ADD CONSTRAINT "OrgService_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgService" ADD CONSTRAINT "OrgService_accessKeyId_fkey" FOREIGN KEY ("accessKeyId") REFERENCES "system"."TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgService" ADD CONSTRAINT "OrgService_descKeyId_fkey" FOREIGN KEY ("descKeyId") REFERENCES "system"."TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgReview" ADD CONSTRAINT "OrgReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "org"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgReview" ADD CONSTRAINT "OrgReview_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "org"."OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgReview" ADD CONSTRAINT "OrgReview_langId_fkey" FOREIGN KEY ("langId") REFERENCES "system"."Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgReview" ADD CONSTRAINT "OrgReview_lcrGovDistId_fkey" FOREIGN KEY ("lcrGovDistId") REFERENCES "system"."GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."OrgReview" ADD CONSTRAINT "OrgReview_lcrCountryId_fkey" FOREIGN KEY ("lcrCountryId") REFERENCES "system"."Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AttributeCategory" ADD CONSTRAINT "AttributeCategory_namespaceId_fkey" FOREIGN KEY ("namespaceId") REFERENCES "system"."TranslationNamespace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."Attribute" ADD CONSTRAINT "Attribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "system"."AttributeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."Attribute" ADD CONSTRAINT "Attribute_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "system"."Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "org"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "org"."OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "system"."ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "system"."ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."ServiceCategory" ADD CONSTRAINT "ServiceCategory_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."ServiceTag" ADD CONSTRAINT "ServiceTag_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."ServiceTag" ADD CONSTRAINT "ServiceTag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "system"."ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."PhoneType" ADD CONSTRAINT "PhoneType_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."SocialMediaService" ADD CONSTRAINT "SocialMediaService_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."Country" ADD CONSTRAINT "Country_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."GovDist" ADD CONSTRAINT "GovDist_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "system"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."GovDist" ADD CONSTRAINT "GovDist_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "system"."GovDistType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."GovDist" ADD CONSTRAINT "GovDist_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "system"."GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."GovDist" ADD CONSTRAINT "GovDist_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."GovDistType" ADD CONSTRAINT "GovDistType_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."TranslationKey" ADD CONSTRAINT "TranslationKey_namespaceId_ns_fkey" FOREIGN KEY ("namespaceId", "ns") REFERENCES "system"."TranslationNamespace"("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."TranslationKey" ADD CONSTRAINT "TranslationKey_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "system"."TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."FieldVisibility" ADD CONSTRAINT "FieldVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."Navigation" ADD CONSTRAINT "Navigation_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."Navigation" ADD CONSTRAINT "Navigation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "system"."Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."FooterLink" ADD CONSTRAINT "FooterLink_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "system"."TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."SocialMediaLink" ADD CONSTRAINT "SocialMediaLink_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "system"."SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "system"."Attribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_attributeCategoryId_fkey" FOREIGN KEY ("attributeCategoryId") REFERENCES "system"."AttributeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_attributeSupplementId_fkey" FOREIGN KEY ("attributeSupplementId") REFERENCES "system"."AttributeSupplement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "system"."Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_footerLinkId_fkey" FOREIGN KEY ("footerLinkId") REFERENCES "system"."FooterLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "system"."GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "system"."GovDistType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "system"."Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "system"."Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "org"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgDescriptionId_fkey" FOREIGN KEY ("orgDescriptionId") REFERENCES "org"."OrgDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "org"."OrgEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgHoursId_fkey" FOREIGN KEY ("orgHoursId") REFERENCES "org"."OrgHours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "org"."OrgPhone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgPhotoId_fkey" FOREIGN KEY ("orgPhotoId") REFERENCES "org"."OrgPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgReviewId_fkey" FOREIGN KEY ("orgReviewId") REFERENCES "org"."OrgReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "org"."OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_orgSocialMediaId_fkey" FOREIGN KEY ("orgSocialMediaId") REFERENCES "org"."OrgSocialMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "system"."OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "system"."PhoneType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "system"."ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "system"."ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_socialMediaLinkId_fkey" FOREIGN KEY ("socialMediaLinkId") REFERENCES "system"."SocialMediaLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_socialMediaServiceId_fkey" FOREIGN KEY ("socialMediaServiceId") REFERENCES "system"."SocialMediaService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "system"."Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "system"."TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."InternalNote" ADD CONSTRAINT "InternalNote_translationNamespaceId_fkey" FOREIGN KEY ("translationNamespaceId") REFERENCES "system"."TranslationNamespace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "system"."Attribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_attributeCategoryId_fkey" FOREIGN KEY ("attributeCategoryId") REFERENCES "system"."AttributeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_attributeSupplementId_fkey" FOREIGN KEY ("attributeSupplementId") REFERENCES "system"."AttributeSupplement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "system"."Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_fieldVisibilityId_fkey" FOREIGN KEY ("fieldVisibilityId") REFERENCES "user"."FieldVisibility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_footerLinkId_fkey" FOREIGN KEY ("footerLinkId") REFERENCES "system"."FooterLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "system"."GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "system"."GovDistType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_internalNoteId_fkey" FOREIGN KEY ("internalNoteId") REFERENCES "system"."InternalNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "system"."Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "system"."Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "org"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgDescriptionId_fkey" FOREIGN KEY ("orgDescriptionId") REFERENCES "org"."OrgDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "org"."OrgEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgHoursId_fkey" FOREIGN KEY ("orgHoursId") REFERENCES "org"."OrgHours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "org"."OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "org"."OrgPhone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgPhotoId_fkey" FOREIGN KEY ("orgPhotoId") REFERENCES "org"."OrgPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgReviewId_fkey" FOREIGN KEY ("orgReviewId") REFERENCES "org"."OrgReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "org"."OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_orgSocialMediaId_fkey" FOREIGN KEY ("orgSocialMediaId") REFERENCES "org"."OrgSocialMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_outsideAPIId_fkey" FOREIGN KEY ("outsideAPIId") REFERENCES "system"."OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_permissionAssetId_fkey" FOREIGN KEY ("permissionAssetId") REFERENCES "user"."PermissionAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_permissionItemId_fkey" FOREIGN KEY ("permissionItemId") REFERENCES "user"."PermissionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "system"."PhoneType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "system"."ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "system"."ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_socialMediaLinkId_fkey" FOREIGN KEY ("socialMediaLinkId") REFERENCES "system"."SocialMediaLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_socialMediaServiceId_fkey" FOREIGN KEY ("socialMediaServiceId") REFERENCES "system"."SocialMediaService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "system"."Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "system"."TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_translationNamespaceId_fkey" FOREIGN KEY ("translationNamespaceId") REFERENCES "system"."TranslationNamespace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userCommunityId_fkey" FOREIGN KEY ("userCommunityId") REFERENCES "user"."UserCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userEthnicityId_fkey" FOREIGN KEY ("userEthnicityId") REFERENCES "user"."UserEthnicity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userImmigrationId_fkey" FOREIGN KEY ("userImmigrationId") REFERENCES "user"."UserImmigration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userMailId_fkey" FOREIGN KEY ("userMailId") REFERENCES "user"."UserMail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user"."UserRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userSavedListId_fkey" FOREIGN KEY ("userSavedListId") REFERENCES "user"."UserSavedList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userSOGIdentityId_fkey" FOREIGN KEY ("userSOGIdentityId") REFERENCES "user"."UserSOGIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userTitleId_fkey" FOREIGN KEY ("userTitleId") REFERENCES "user"."UserTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "user"."UserType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_UserToUserEthnicity" ADD CONSTRAINT "_UserToUserEthnicity_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_UserToUserEthnicity" ADD CONSTRAINT "_UserToUserEthnicity_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."UserEthnicity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_UserToUserSOGIdentity" ADD CONSTRAINT "_UserToUserSOGIdentity_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_UserToUserSOGIdentity" ADD CONSTRAINT "_UserToUserSOGIdentity_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."UserSOGIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_UserToUserCommunity" ADD CONSTRAINT "_UserToUserCommunity_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_UserToUserCommunity" ADD CONSTRAINT "_UserToUserCommunity_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."UserCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_sharedLists" ADD CONSTRAINT "_sharedLists_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_sharedLists" ADD CONSTRAINT "_sharedLists_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_PermissionItemToUser" ADD CONSTRAINT "_PermissionItemToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."PermissionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_PermissionItemToUser" ADD CONSTRAINT "_PermissionItemToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_PermissionItemToUserRole" ADD CONSTRAINT "_PermissionItemToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "user"."PermissionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."_PermissionItemToUserRole" ADD CONSTRAINT "_PermissionItemToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."_OrganizationToUserSavedList" ADD CONSTRAINT "_OrganizationToUserSavedList_A_fkey" FOREIGN KEY ("A") REFERENCES "org"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."_OrganizationToUserSavedList" ADD CONSTRAINT "_OrganizationToUserSavedList_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."_OrganizationToPermissionAsset" ADD CONSTRAINT "_OrganizationToPermissionAsset_A_fkey" FOREIGN KEY ("A") REFERENCES "org"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."_OrganizationToPermissionAsset" ADD CONSTRAINT "_OrganizationToPermissionAsset_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."PermissionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."_OrgLocationToPermissionAsset" ADD CONSTRAINT "_OrgLocationToPermissionAsset_A_fkey" FOREIGN KEY ("A") REFERENCES "org"."OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."_OrgLocationToPermissionAsset" ADD CONSTRAINT "_OrgLocationToPermissionAsset_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."PermissionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToOrganization" ADD CONSTRAINT "_AttributeToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "system"."Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToOrganization" ADD CONSTRAINT "_AttributeToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "org"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToOrgLocation" ADD CONSTRAINT "_AttributeToOrgLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "system"."Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToOrgLocation" ADD CONSTRAINT "_AttributeToOrgLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "org"."OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToOrgService" ADD CONSTRAINT "_AttributeToOrgService_A_fkey" FOREIGN KEY ("A") REFERENCES "system"."Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToOrgService" ADD CONSTRAINT "_AttributeToOrgService_B_fkey" FOREIGN KEY ("B") REFERENCES "org"."OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToServiceCategory" ADD CONSTRAINT "_AttributeToServiceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "system"."Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToServiceCategory" ADD CONSTRAINT "_AttributeToServiceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "system"."ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToServiceTag" ADD CONSTRAINT "_AttributeToServiceTag_A_fkey" FOREIGN KEY ("A") REFERENCES "system"."Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AttributeToServiceTag" ADD CONSTRAINT "_AttributeToServiceTag_B_fkey" FOREIGN KEY ("B") REFERENCES "system"."ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_countryOrigin" ADD CONSTRAINT "_countryOrigin_A_fkey" FOREIGN KEY ("A") REFERENCES "system"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_countryOrigin" ADD CONSTRAINT "_countryOrigin_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AuditLogEntry" ADD CONSTRAINT "_AuditLogEntry_A_fkey" FOREIGN KEY ("A") REFERENCES "system"."AuditLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."_AuditLogEntry" ADD CONSTRAINT "_AuditLogEntry_B_fkey" FOREIGN KEY ("B") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
