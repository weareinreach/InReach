-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserSavedListVisibility" AS ENUM ('PRIVATE', 'SHARED_USER', 'SHARED_LINK', 'PUBLIC');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('EXTERNAL', 'ORGANIZATION', 'SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "VisibilitySetting" AS ENUM ('NONE', 'LOGGED_IN', 'PROVIDER', 'PUBLIC');

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
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "legacyId" TEXT,
    "birthYear" SMALLINT,
    "reasonForJoin" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
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
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTitle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "searchable" BOOLEAN NOT NULL DEFAULT false,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEthnicity" (
    "id" TEXT NOT NULL,
    "ethnicity" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEthnicity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImmigration" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserImmigration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSOGIdentity" (
    "id" TEXT NOT NULL,
    "identifyAs" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSOGIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCommunity" (
    "id" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSavedList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visibility" "UserSavedListVisibility" NOT NULL DEFAULT 'PRIVATE',
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
    "toExternal" TEXT[],
    "read" BOOLEAN NOT NULL DEFAULT false,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "from" TEXT,
    "fromUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responseToId" TEXT,

    CONSTRAINT "UserMail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
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
CREATE TABLE "OrgDescription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgEmail" (
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
CREATE TABLE "OrgPhone" (
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
CREATE TABLE "OrgSocialMedia" (
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
CREATE TABLE "OrgLocation" (
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
CREATE TABLE "OrgPhoto" (
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
CREATE TABLE "OrgHours" (
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
CREATE TABLE "OrgService" (
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
CREATE TABLE "OrgReview" (
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
CREATE TABLE "AttributeCategory" (
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
CREATE TABLE "Attribute" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intDesc" TEXT,
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
CREATE TABLE "AttributeSupplement" (
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
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaService" (
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
    "geoJSON" JSONB,
    "keyId" TEXT NOT NULL,
    "demonymId" TEXT,
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
CREATE TABLE "GovDistType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationNamespace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationKey" (
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
CREATE TABLE "OutsideAPI" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urlPattern" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutsideAPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldVisibility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "lastName" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "lastNameInit" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
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
    "keyId" TEXT NOT NULL,
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
    "keyId" TEXT NOT NULL,
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
CREATE TABLE "AuditLog" (
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
CREATE TABLE "_UserToUserEthnicity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserToUserSOGIdentity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserToUserCommunity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_sharedLists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionItemToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionItemToUserRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrganizationToUserSavedList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrganizationToPermissionAsset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrgLocationToPermissionAsset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToAttributeCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToOrgLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToOrgService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToServiceCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToServiceTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_countryOrigin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AuditLogEntry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
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
CREATE UNIQUE INDEX "PermissionItem_name_key" ON "PermissionItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_type_key" ON "UserType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_keyId_key" ON "UserType"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTitle_title_key" ON "UserTitle"("title");

-- CreateIndex
CREATE UNIQUE INDEX "UserTitle_keyId_key" ON "UserTitle"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEthnicity_ethnicity_key" ON "UserEthnicity"("ethnicity");

-- CreateIndex
CREATE UNIQUE INDEX "UserEthnicity_keyId_key" ON "UserEthnicity"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserImmigration_status_key" ON "UserImmigration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserImmigration_keyId_key" ON "UserImmigration"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSOGIdentity_identifyAs_key" ON "UserSOGIdentity"("identifyAs");

-- CreateIndex
CREATE UNIQUE INDEX "UserSOGIdentity_keyId_key" ON "UserSOGIdentity"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunity_community_key" ON "UserCommunity"("community");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunity_keyId_key" ON "UserCommunity"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedList_sharedLinkKey_key" ON "UserSavedList"("sharedLinkKey");

-- CreateIndex
CREATE INDEX "UserSavedList_ownedById_idx" ON "UserSavedList"("ownedById");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_legacyId_key" ON "Organization"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OrgDescription_orgId_key" ON "OrgDescription"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgDescription_keyId_key" ON "OrgDescription"("keyId");

-- CreateIndex
CREATE INDEX "OrgDescription_keyId_orgId_idx" ON "OrgDescription"("keyId", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgEmail_userId_key" ON "OrgEmail"("userId");

-- CreateIndex
CREATE INDEX "OrgEmail_lastName_firstName_idx" ON "OrgEmail"("lastName" ASC, "firstName");

-- CreateIndex
CREATE INDEX "OrgEmail_email_idx" ON "OrgEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrgPhone_userId_key" ON "OrgPhone"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgLocation_orgId_key" ON "OrgLocation"("orgId");

-- CreateIndex
CREATE INDEX "OrgLocation_latitude_longitude_idx" ON "OrgLocation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "OrgLocation_geoJSON_idx" ON "OrgLocation" USING GIN ("geoJSON" jsonb_path_ops);

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_accessKeyId_key" ON "OrgService"("accessKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_descKeyId_key" ON "OrgService"("descKeyId");

-- CreateIndex
CREATE INDEX "OrgService_organizationId_idx" ON "OrgService"("organizationId" ASC);

-- CreateIndex
CREATE INDEX "OrgService_orgLocationId_idx" ON "OrgService"("orgLocationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_serviceId_organizationId_key" ON "OrgService"("serviceId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_serviceId_orgLocationId_key" ON "OrgService"("serviceId", "orgLocationId");

-- CreateIndex
CREATE INDEX "OrgReview_organizationId_idx" ON "OrgReview"("organizationId" ASC);

-- CreateIndex
CREATE INDEX "OrgReview_orgServiceId_idx" ON "OrgReview"("orgServiceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_tag_key" ON "AttributeCategory"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_name_key" ON "AttributeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_tag_key" ON "Attribute"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "Attribute"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_keyId_key" ON "Attribute"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_category_key" ON "ServiceCategory"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_keyId_key" ON "ServiceCategory"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_keyId_key" ON "ServiceTag"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_name_categoryId_key" ON "ServiceTag"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneType_type_key" ON "PhoneType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneType_keyId_key" ON "PhoneType"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaService_name_key" ON "SocialMediaService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaService_keyId_key" ON "SocialMediaService"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_source_key" ON "Source"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca2_key" ON "Country"("cca2");

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca3_key" ON "Country"("cca3");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Country_keyId_key" ON "Country"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_demonymId_key" ON "Country"("demonymId");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_slug_key" ON "GovDist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_keyId_key" ON "GovDist"("keyId");

-- CreateIndex
CREATE INDEX "GovDist_countryId_idx" ON "GovDist"("countryId");

-- CreateIndex
CREATE INDEX "GovDist_parentId_idx" ON "GovDist"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "GovDistType_name_key" ON "GovDistType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GovDistType_keyId_key" ON "GovDistType"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_localeCode_key" ON "Language"("localeCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationNamespace_name_key" ON "TranslationNamespace"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationNamespace_id_name_key" ON "TranslationNamespace"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationKey_ns_key_key" ON "TranslationKey"("ns" ASC, "key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OutsideAPI_name_key" ON "OutsideAPI"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_keyId_key" ON "Navigation"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_display_href_key" ON "Navigation"("display", "href");

-- CreateIndex
CREATE UNIQUE INDEX "FooterLink_keyId_key" ON "FooterLink"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "FooterLink_display_href_key" ON "FooterLink"("display", "href");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaLink_href_key" ON "SocialMediaLink"("href");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_timestamp_recordId_key" ON "AuditLog"("timestamp", "recordId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserEthnicity_AB_unique" ON "_UserToUserEthnicity"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserEthnicity_B_index" ON "_UserToUserEthnicity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserSOGIdentity_AB_unique" ON "_UserToUserSOGIdentity"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserSOGIdentity_B_index" ON "_UserToUserSOGIdentity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserCommunity_AB_unique" ON "_UserToUserCommunity"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserCommunity_B_index" ON "_UserToUserCommunity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_sharedLists_AB_unique" ON "_sharedLists"("A", "B");

-- CreateIndex
CREATE INDEX "_sharedLists_B_index" ON "_sharedLists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionItemToUser_AB_unique" ON "_PermissionItemToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionItemToUser_B_index" ON "_PermissionItemToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionItemToUserRole_AB_unique" ON "_PermissionItemToUserRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionItemToUserRole_B_index" ON "_PermissionItemToUserRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToUserSavedList_AB_unique" ON "_OrganizationToUserSavedList"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToUserSavedList_B_index" ON "_OrganizationToUserSavedList"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToPermissionAsset_AB_unique" ON "_OrganizationToPermissionAsset"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToPermissionAsset_B_index" ON "_OrganizationToPermissionAsset"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgLocationToPermissionAsset_AB_unique" ON "_OrgLocationToPermissionAsset"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgLocationToPermissionAsset_B_index" ON "_OrgLocationToPermissionAsset"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToAttributeCategory_AB_unique" ON "_AttributeToAttributeCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToAttributeCategory_B_index" ON "_AttributeToAttributeCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrganization_AB_unique" ON "_AttributeToOrganization"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrganization_B_index" ON "_AttributeToOrganization"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrgLocation_AB_unique" ON "_AttributeToOrgLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrgLocation_B_index" ON "_AttributeToOrgLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrgService_AB_unique" ON "_AttributeToOrgService"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrgService_B_index" ON "_AttributeToOrgService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToServiceCategory_AB_unique" ON "_AttributeToServiceCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToServiceCategory_B_index" ON "_AttributeToServiceCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToServiceTag_AB_unique" ON "_AttributeToServiceTag"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToServiceTag_B_index" ON "_AttributeToServiceTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_countryOrigin_AB_unique" ON "_countryOrigin"("A", "B");

-- CreateIndex
CREATE INDEX "_countryOrigin_B_index" ON "_countryOrigin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AuditLogEntry_AB_unique" ON "_AuditLogEntry"("A", "B");

-- CreateIndex
CREATE INDEX "_AuditLogEntry_B_index" ON "_AuditLogEntry"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentGovDistId_fkey" FOREIGN KEY ("currentGovDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentCountryId_fkey" FOREIGN KEY ("currentCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_immigrationId_fkey" FOREIGN KEY ("immigrationId") REFERENCES "UserImmigration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_langPrefId_fkey" FOREIGN KEY ("langPrefId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_associatedOrgId_fkey" FOREIGN KEY ("associatedOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgTitleId_fkey" FOREIGN KEY ("orgTitleId") REFERENCES "UserTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionAsset" ADD CONSTRAINT "PermissionAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionAsset" ADD CONSTRAINT "PermissionAsset_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "PermissionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserType" ADD CONSTRAINT "UserType_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTitle" ADD CONSTRAINT "UserTitle_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEthnicity" ADD CONSTRAINT "UserEthnicity_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImmigration" ADD CONSTRAINT "UserImmigration_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOGIdentity" ADD CONSTRAINT "UserSOGIdentity_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommunity" ADD CONSTRAINT "UserCommunity_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSavedList" ADD CONSTRAINT "UserSavedList_ownedById_fkey" FOREIGN KEY ("ownedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMail" ADD CONSTRAINT "UserMail_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMail" ADD CONSTRAINT "UserMail_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMail" ADD CONSTRAINT "UserMail_responseToId_fkey" FOREIGN KEY ("responseToId") REFERENCES "UserMail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDescription" ADD CONSTRAINT "OrgDescription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDescription" ADD CONSTRAINT "OrgDescription_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "UserTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhoto" ADD CONSTRAINT "OrgPhoto_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhoto" ADD CONSTRAINT "OrgPhoto_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgHours" ADD CONSTRAINT "OrgHours_orgLocId_fkey" FOREIGN KEY ("orgLocId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgHours" ADD CONSTRAINT "OrgHours_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_accessKeyId_fkey" FOREIGN KEY ("accessKeyId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_descKeyId_fkey" FOREIGN KEY ("descKeyId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_lcrGovDistId_fkey" FOREIGN KEY ("lcrGovDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_lcrCountryId_fkey" FOREIGN KEY ("lcrCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeCategory" ADD CONSTRAINT "AttributeCategory_namespaceId_fkey" FOREIGN KEY ("namespaceId") REFERENCES "TranslationNamespace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTag" ADD CONSTRAINT "ServiceTag_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTag" ADD CONSTRAINT "ServiceTag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneType" ADD CONSTRAINT "PhoneType_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaService" ADD CONSTRAINT "SocialMediaService_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_demonymId_fkey" FOREIGN KEY ("demonymId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "GovDistType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDistType" ADD CONSTRAINT "GovDistType_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationKey" ADD CONSTRAINT "TranslationKey_namespaceId_ns_fkey" FOREIGN KEY ("namespaceId", "ns") REFERENCES "TranslationNamespace"("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationKey" ADD CONSTRAINT "TranslationKey_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVisibility" ADD CONSTRAINT "FieldVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLink" ADD CONSTRAINT "FooterLink_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaLink" ADD CONSTRAINT "SocialMediaLink_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_attributeCategoryId_fkey" FOREIGN KEY ("attributeCategoryId") REFERENCES "AttributeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_attributeSupplementId_fkey" FOREIGN KEY ("attributeSupplementId") REFERENCES "AttributeSupplement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_footerLinkId_fkey" FOREIGN KEY ("footerLinkId") REFERENCES "FooterLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "GovDistType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgDescriptionId_fkey" FOREIGN KEY ("orgDescriptionId") REFERENCES "OrgDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgHoursId_fkey" FOREIGN KEY ("orgHoursId") REFERENCES "OrgHours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgPhotoId_fkey" FOREIGN KEY ("orgPhotoId") REFERENCES "OrgPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgReviewId_fkey" FOREIGN KEY ("orgReviewId") REFERENCES "OrgReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgSocialMediaId_fkey" FOREIGN KEY ("orgSocialMediaId") REFERENCES "OrgSocialMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_socialMediaLinkId_fkey" FOREIGN KEY ("socialMediaLinkId") REFERENCES "SocialMediaLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_socialMediaServiceId_fkey" FOREIGN KEY ("socialMediaServiceId") REFERENCES "SocialMediaService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_translationNamespaceId_fkey" FOREIGN KEY ("translationNamespaceId") REFERENCES "TranslationNamespace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_attributeCategoryId_fkey" FOREIGN KEY ("attributeCategoryId") REFERENCES "AttributeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_attributeSupplementId_fkey" FOREIGN KEY ("attributeSupplementId") REFERENCES "AttributeSupplement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_fieldVisibilityId_fkey" FOREIGN KEY ("fieldVisibilityId") REFERENCES "FieldVisibility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_footerLinkId_fkey" FOREIGN KEY ("footerLinkId") REFERENCES "FooterLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "GovDistType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_internalNoteId_fkey" FOREIGN KEY ("internalNoteId") REFERENCES "InternalNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "Navigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgDescriptionId_fkey" FOREIGN KEY ("orgDescriptionId") REFERENCES "OrgDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgHoursId_fkey" FOREIGN KEY ("orgHoursId") REFERENCES "OrgHours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgPhotoId_fkey" FOREIGN KEY ("orgPhotoId") REFERENCES "OrgPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgReviewId_fkey" FOREIGN KEY ("orgReviewId") REFERENCES "OrgReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgSocialMediaId_fkey" FOREIGN KEY ("orgSocialMediaId") REFERENCES "OrgSocialMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_outsideAPIId_fkey" FOREIGN KEY ("outsideAPIId") REFERENCES "OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_permissionAssetId_fkey" FOREIGN KEY ("permissionAssetId") REFERENCES "PermissionAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_permissionItemId_fkey" FOREIGN KEY ("permissionItemId") REFERENCES "PermissionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_socialMediaLinkId_fkey" FOREIGN KEY ("socialMediaLinkId") REFERENCES "SocialMediaLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_socialMediaServiceId_fkey" FOREIGN KEY ("socialMediaServiceId") REFERENCES "SocialMediaService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_translationNamespaceId_fkey" FOREIGN KEY ("translationNamespaceId") REFERENCES "TranslationNamespace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userCommunityId_fkey" FOREIGN KEY ("userCommunityId") REFERENCES "UserCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userEthnicityId_fkey" FOREIGN KEY ("userEthnicityId") REFERENCES "UserEthnicity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userImmigrationId_fkey" FOREIGN KEY ("userImmigrationId") REFERENCES "UserImmigration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userMailId_fkey" FOREIGN KEY ("userMailId") REFERENCES "UserMail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "UserRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userSavedListId_fkey" FOREIGN KEY ("userSavedListId") REFERENCES "UserSavedList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userSOGIdentityId_fkey" FOREIGN KEY ("userSOGIdentityId") REFERENCES "UserSOGIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userTitleId_fkey" FOREIGN KEY ("userTitleId") REFERENCES "UserTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserEthnicity" ADD CONSTRAINT "_UserToUserEthnicity_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserEthnicity" ADD CONSTRAINT "_UserToUserEthnicity_B_fkey" FOREIGN KEY ("B") REFERENCES "UserEthnicity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserSOGIdentity" ADD CONSTRAINT "_UserToUserSOGIdentity_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserSOGIdentity" ADD CONSTRAINT "_UserToUserSOGIdentity_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSOGIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserCommunity" ADD CONSTRAINT "_UserToUserCommunity_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserCommunity" ADD CONSTRAINT "_UserToUserCommunity_B_fkey" FOREIGN KEY ("B") REFERENCES "UserCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedLists" ADD CONSTRAINT "_sharedLists_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedLists" ADD CONSTRAINT "_sharedLists_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUser" ADD CONSTRAINT "_PermissionItemToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "PermissionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUser" ADD CONSTRAINT "_PermissionItemToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUserRole" ADD CONSTRAINT "_PermissionItemToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "PermissionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUserRole" ADD CONSTRAINT "_PermissionItemToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUserSavedList" ADD CONSTRAINT "_OrganizationToUserSavedList_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUserSavedList" ADD CONSTRAINT "_OrganizationToUserSavedList_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToPermissionAsset" ADD CONSTRAINT "_OrganizationToPermissionAsset_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToPermissionAsset" ADD CONSTRAINT "_OrganizationToPermissionAsset_B_fkey" FOREIGN KEY ("B") REFERENCES "PermissionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToPermissionAsset" ADD CONSTRAINT "_OrgLocationToPermissionAsset_A_fkey" FOREIGN KEY ("A") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToPermissionAsset" ADD CONSTRAINT "_OrgLocationToPermissionAsset_B_fkey" FOREIGN KEY ("B") REFERENCES "PermissionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToAttributeCategory" ADD CONSTRAINT "_AttributeToAttributeCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToAttributeCategory" ADD CONSTRAINT "_AttributeToAttributeCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "AttributeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrganization" ADD CONSTRAINT "_AttributeToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrganization" ADD CONSTRAINT "_AttributeToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgLocation" ADD CONSTRAINT "_AttributeToOrgLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgLocation" ADD CONSTRAINT "_AttributeToOrgLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgService" ADD CONSTRAINT "_AttributeToOrgService_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgService" ADD CONSTRAINT "_AttributeToOrgService_B_fkey" FOREIGN KEY ("B") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceCategory" ADD CONSTRAINT "_AttributeToServiceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceCategory" ADD CONSTRAINT "_AttributeToServiceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceTag" ADD CONSTRAINT "_AttributeToServiceTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceTag" ADD CONSTRAINT "_AttributeToServiceTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_countryOrigin" ADD CONSTRAINT "_countryOrigin_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_countryOrigin" ADD CONSTRAINT "_countryOrigin_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditLogEntry" ADD CONSTRAINT "_AuditLogEntry_A_fkey" FOREIGN KEY ("A") REFERENCES "AuditLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditLogEntry" ADD CONSTRAINT "_AuditLogEntry_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

