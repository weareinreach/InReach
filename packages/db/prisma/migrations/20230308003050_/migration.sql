-- DropForeignKey
ALTER TABLE
	"AuditLog" DROP CONSTRAINT "AuditLog_footerLinkId_fkey";

-- DropForeignKey
ALTER TABLE
	"AuditLog" DROP CONSTRAINT "AuditLog_navigationId_fkey";

-- DropForeignKey
ALTER TABLE
	"FooterLink" DROP CONSTRAINT "FooterLink_tsKey_tsNs_fkey";

-- DropForeignKey
ALTER TABLE
	"InternalNote" DROP CONSTRAINT "InternalNote_footerLinkId_fkey";

-- DropForeignKey
ALTER TABLE
	"InternalNote" DROP CONSTRAINT "InternalNote_navigationId_fkey";

-- DropForeignKey
ALTER TABLE
	"Navigation" DROP CONSTRAINT "Navigation_parentId_fkey";

-- DropForeignKey
ALTER TABLE
	"Navigation" DROP CONSTRAINT "Navigation_tsKey_tsNs_fkey";

-- DropForeignKey
ALTER TABLE
	"OrgEmail" DROP CONSTRAINT "OrgEmail_orgId_fkey";

-- DropForeignKey
ALTER TABLE
	"OrgPhone" DROP CONSTRAINT "OrgPhone_organizationId_fkey";

-- AlterTable
ALTER TABLE
	"AttributeSupplement"
ADD
	COLUMN "govDistId" TEXT;

-- AlterTable
ALTER TABLE
	"AuditLog" DROP COLUMN "footerLinkId",
	DROP COLUMN "navigationId";

-- AlterTable
ALTER TABLE
	"InternalNote" DROP COLUMN "footerLinkId",
	DROP COLUMN "navigationId";

-- AlterTable
ALTER TABLE
	"OrgEmail" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE
	"OrgPhone" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE
	"OrgSocialMedia"
ALTER COLUMN
	"organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE
	"OrgWebsite"
ADD
	COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN
	"organizationId" DROP NOT NULL;

-- DropTable
DROP TABLE "FooterLink";

-- DropTable
DROP TABLE "Navigation";

-- CreateTable
CREATE TABLE "OrganizationPhone" (
	"organizationId" TEXT NOT NULL,
	"phoneId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrganizationPhone_pkey" PRIMARY KEY ("organizationId", "phoneId")
);

-- CreateTable
CREATE TABLE "OrganizationEmail" (
	"orgEmailId" TEXT NOT NULL,
	"organizationId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "OrganizationEmail_pkey" PRIMARY KEY ("orgEmailId", "organizationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPhone_phoneId_key" ON "OrganizationPhone"("phoneId");

-- AddForeignKey
ALTER TABLE
	"AttributeSupplement"
ADD
	CONSTRAINT "AttributeSupplement_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationPhone"
ADD
	CONSTRAINT "OrganizationPhone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationPhone"
ADD
	CONSTRAINT "OrganizationPhone_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "OrgPhone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationEmail"
ADD
	CONSTRAINT "OrganizationEmail_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"OrganizationEmail"
ADD
	CONSTRAINT "OrganizationEmail_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;