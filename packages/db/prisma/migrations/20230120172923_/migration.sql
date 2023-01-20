/*
  Warnings:

  - You are about to drop the column `visibility` on the `UserSavedList` table. All the data in the column will be lost.
  - You are about to drop the `LocationAttributeSupplement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationAttributeSupplement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceAccessAttributeSupplement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceAttributeSupplement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[supplementId]` on the table `LocationAttribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplementId]` on the table `OrganizationAttribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplementId]` on the table `ServiceAccessAttribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplementId]` on the table `ServiceAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "LocationAttributeSupplement" DROP CONSTRAINT "LocationAttributeSupplement_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "LocationAttributeSupplement" DROP CONSTRAINT "LocationAttributeSupplement_locationId_fkey";

-- DropForeignKey
ALTER TABLE "LocationAttributeSupplement" DROP CONSTRAINT "LocationAttributeSupplement_supplementId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationAttributeSupplement" DROP CONSTRAINT "OrganizationAttributeSupplement_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationAttributeSupplement" DROP CONSTRAINT "OrganizationAttributeSupplement_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationAttributeSupplement" DROP CONSTRAINT "OrganizationAttributeSupplement_supplementId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccessAttributeSupplement" DROP CONSTRAINT "ServiceAccessAttributeSupplement_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccessAttributeSupplement" DROP CONSTRAINT "ServiceAccessAttributeSupplement_serviceAccessId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccessAttributeSupplement" DROP CONSTRAINT "ServiceAccessAttributeSupplement_supplementId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAttributeSupplement" DROP CONSTRAINT "ServiceAttributeSupplement_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAttributeSupplement" DROP CONSTRAINT "ServiceAttributeSupplement_orgServiceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAttributeSupplement" DROP CONSTRAINT "ServiceAttributeSupplement_supplementId_fkey";

-- AlterTable
ALTER TABLE "LocationAttribute" ADD COLUMN     "supplementId" TEXT;

-- AlterTable
ALTER TABLE "OrganizationAttribute" ADD COLUMN     "supplementId" TEXT;

-- AlterTable
ALTER TABLE "ServiceAccessAttribute" ADD COLUMN     "supplementId" TEXT;

-- AlterTable
ALTER TABLE "ServiceAttribute" ADD COLUMN     "supplementId" TEXT;

-- AlterTable
ALTER TABLE "UserSavedList" DROP COLUMN "visibility";

-- DropTable
DROP TABLE "LocationAttributeSupplement";

-- DropTable
DROP TABLE "OrganizationAttributeSupplement";

-- DropTable
DROP TABLE "ServiceAccessAttributeSupplement";

-- DropTable
DROP TABLE "ServiceAttributeSupplement";

-- DropEnum
DROP TYPE "UserSavedListVisibility";

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

-- CreateIndex
CREATE INDEX "TranslatedReview_reviewId_idx" ON "TranslatedReview"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationAttribute_supplementId_key" ON "LocationAttribute"("supplementId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationAttribute_supplementId_key" ON "OrganizationAttribute"("supplementId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAccessAttribute_supplementId_key" ON "ServiceAccessAttribute"("supplementId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAttribute_supplementId_key" ON "ServiceAttribute"("supplementId");

-- CreateIndex
CREATE INDEX "UserSavedList_sharedLinkKey_idx" ON "UserSavedList"("sharedLinkKey");

-- AddForeignKey
ALTER TABLE "TranslatedReview" ADD CONSTRAINT "TranslatedReview_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "OrgReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslatedReview" ADD CONSTRAINT "TranslatedReview_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAttribute" ADD CONSTRAINT "OrganizationAttribute_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "AttributeSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationAttribute" ADD CONSTRAINT "LocationAttribute_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "AttributeSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAttribute" ADD CONSTRAINT "ServiceAttribute_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "AttributeSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAccessAttribute" ADD CONSTRAINT "ServiceAccessAttribute_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "AttributeSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
