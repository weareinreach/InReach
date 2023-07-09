-- AlterTable
ALTER TABLE "AssignedRole"
	ADD COLUMN "authorized" BOOLEAN NOT NULL DEFAULT FALSE;

-- AlterTable
ALTER TABLE "LocationAttribute"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrgLocationService"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrgServiceTag"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "OrganizationAttribute"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "ServiceAccessAttribute"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "ServiceAreaCountry"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "ServiceAreaDist"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "ServiceAttribute"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "UserAttribute"
	ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE "UserPermission"
	ADD COLUMN "authorized" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE
	"UserPermission"
SET
	"authorized" = TRUE
WHERE
	"authorized" = FALSE;

-- AlterTable
ALTER TABLE "UserToOrganization"
	ADD COLUMN "authorized" BOOLEAN NOT NULL DEFAULT FALSE;

