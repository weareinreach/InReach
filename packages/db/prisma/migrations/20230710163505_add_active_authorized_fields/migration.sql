-- AlterTable
ALTER TABLE "OrgLocationEmail"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrgLocationPhone"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrgPhoneLanguage"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrgServiceEmail"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrgServicePhone"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrgWebsiteLanguage"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrganizationEmail"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrganizationPhone"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "RolePermission"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "ServiceCategoryDefaultAttribute"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "ServiceTagCountry"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "ServiceTagDefaultAttribute"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

