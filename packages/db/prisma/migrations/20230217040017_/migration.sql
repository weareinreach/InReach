/*
  Warnings:

  - The values [INTERVAL] on the enum `TranslationPlurals` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `supplementId` on the `LocationAttribute` table. All the data in the column will be lost.
  - You are about to drop the column `supplementId` on the `OrganizationAttribute` table. All the data in the column will be lost.
  - You are about to drop the column `supplementId` on the `ServiceAccessAttribute` table. All the data in the column will be lost.
  - You are about to drop the column `supplementId` on the `ServiceAttribute` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TranslationPlurals_new" AS ENUM ('SINGLE', 'PLURAL', 'ORDINAL');
ALTER TABLE "TranslationKey" ALTER COLUMN "plural" DROP DEFAULT;
ALTER TABLE "TranslationKey" ALTER COLUMN "plural" TYPE "TranslationPlurals_new" USING ("plural"::text::"TranslationPlurals_new");
ALTER TYPE "TranslationPlurals" RENAME TO "TranslationPlurals_old";
ALTER TYPE "TranslationPlurals_new" RENAME TO "TranslationPlurals";
DROP TYPE "TranslationPlurals_old";
ALTER TABLE "TranslationKey" ALTER COLUMN "plural" SET DEFAULT 'SINGLE';
COMMIT;

-- DropForeignKey
ALTER TABLE "LocationAttribute" DROP CONSTRAINT "LocationAttribute_supplementId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationAttribute" DROP CONSTRAINT "OrganizationAttribute_supplementId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccessAttribute" DROP CONSTRAINT "ServiceAccessAttribute_supplementId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAttribute" DROP CONSTRAINT "ServiceAttribute_supplementId_fkey";

-- DropIndex
DROP INDEX "LocationAttribute_supplementId_key";

-- DropIndex
DROP INDEX "OrganizationAttribute_supplementId_key";

-- DropIndex
DROP INDEX "ServiceAccessAttribute_supplementId_key";

-- DropIndex
DROP INDEX "ServiceAttribute_supplementId_key";

-- AlterTable
ALTER TABLE "AttributeSupplement" ADD COLUMN     "locationAttributeAttributeId" TEXT,
ADD COLUMN     "locationAttributeLocationId" TEXT,
ADD COLUMN     "organizationAttributeAttributeId" TEXT,
ADD COLUMN     "organizationAttributeOrganizationId" TEXT,
ADD COLUMN     "serviceAccessAttributeAttributeId" TEXT,
ADD COLUMN     "serviceAccessAttributeServiceAccessId" TEXT,
ADD COLUMN     "serviceAttributeAttributeId" TEXT,
ADD COLUMN     "serviceAttributeOrgServiceId" TEXT;

-- AlterTable
ALTER TABLE "LocationAttribute" DROP COLUMN "supplementId";

-- AlterTable
ALTER TABLE "OrganizationAttribute" DROP COLUMN "supplementId";

-- AlterTable
ALTER TABLE "ServiceAccessAttribute" DROP COLUMN "supplementId";

-- AlterTable
ALTER TABLE "ServiceAttribute" DROP COLUMN "supplementId";

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_locationAttributeAttributeId_locationA_fkey" FOREIGN KEY ("locationAttributeAttributeId", "locationAttributeLocationId") REFERENCES "LocationAttribute"("attributeId", "locationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_organizationAttributeAttributeId_organ_fkey" FOREIGN KEY ("organizationAttributeAttributeId", "organizationAttributeOrganizationId") REFERENCES "OrganizationAttribute"("attributeId", "organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceAccessAttributeAttributeId_serv_fkey" FOREIGN KEY ("serviceAccessAttributeAttributeId", "serviceAccessAttributeServiceAccessId") REFERENCES "ServiceAccessAttribute"("attributeId", "serviceAccessId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceAttributeAttributeId_serviceAtt_fkey" FOREIGN KEY ("serviceAttributeAttributeId", "serviceAttributeOrgServiceId") REFERENCES "ServiceAttribute"("attributeId", "orgServiceId") ON DELETE SET NULL ON UPDATE CASCADE;
