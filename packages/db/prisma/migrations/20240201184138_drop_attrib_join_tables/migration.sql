/*
 Warnings:

 - You are about to drop the column `locationAttributeAttributeId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `locationAttributeLocationId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `organizationAttributeAttributeId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `organizationAttributeOrganizationId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `serviceAccessAttributeAttributeId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `serviceAccessAttributeServiceId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `serviceAttributeAttributeId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `serviceAttributeOrgServiceId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `userAttributeAttributeId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `userAttributeUserId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the `LocationAttribute` table. If the table is not empty, all the data it contains will be lost.
 - You are about to drop the `OrganizationAttribute` table. If the table is not empty, all the data it contains will be lost.
 - You are about to drop the `ServiceAccessAttribute` table. If the table is not empty, all the data it contains will be lost.
 - You are about to drop the `ServiceAttribute` table. If the table is not empty, all the data it contains will be lost.
 - You are about to drop the `UserAttribute` table. If the table is not empty, all the data it contains will be lost.
 - Made the column `attributeId` on table `AttributeSupplement` required. This step will fail if there are existing NULL values in that column.
 */
-- DropForeignKey
ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_locationAttributeAttributeId_locationA_fkey";

-- DropForeignKey
ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_organizationAttributeAttributeId_organ_fkey";

-- DropForeignKey
ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_serviceAccessAttributeAttributeId_serv_fkey";

-- DropForeignKey
ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_serviceAttributeAttributeId_serviceAtt_fkey";

-- DropForeignKey
ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_userAttributeAttributeId_userAttribute_fkey";

-- DropForeignKey
ALTER TABLE "LocationAttribute"
	DROP CONSTRAINT "LocationAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "LocationAttribute"
	DROP CONSTRAINT "LocationAttribute_locationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationAttribute"
	DROP CONSTRAINT "OrganizationAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationAttribute"
	DROP CONSTRAINT "OrganizationAttribute_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccessAttribute"
	DROP CONSTRAINT "ServiceAccessAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccessAttribute"
	DROP CONSTRAINT "ServiceAccessAttribute_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAttribute"
	DROP CONSTRAINT "ServiceAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAttribute"
	DROP CONSTRAINT "ServiceAttribute_orgServiceId_fkey";

-- DropForeignKey
ALTER TABLE "UserAttribute"
	DROP CONSTRAINT "UserAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "UserAttribute"
	DROP CONSTRAINT "UserAttribute_userId_fkey";

-- DropIndex
DROP INDEX "AttributeSupplement_locationAttributeAttributeId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_locationAttributeAttributeId_locationAt_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_locationAttributeLocationId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_organizationAttributeAttributeId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_organizationAttributeAttributeId_organi_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_organizationAttributeOrganizationId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAccessAttributeServiceId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAttributeAttributeId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAttributeAttributeId_serviceAttr_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAttributeOrgServiceId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_userAttributeAttributeId_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_userAttributeAttributeId_userAttributeU_idx";

-- DropIndex
DROP INDEX "AttributeSupplement_userAttributeUserId_idx";

-- AlterTable
ALTER TABLE "AttributeSupplement"
	DROP COLUMN "locationAttributeAttributeId",
	DROP COLUMN "locationAttributeLocationId",
	DROP COLUMN "organizationAttributeAttributeId",
	DROP COLUMN "organizationAttributeOrganizationId",
	DROP COLUMN "serviceAccessAttributeAttributeId",
	DROP COLUMN "serviceAccessAttributeServiceId",
	DROP COLUMN "serviceAttributeAttributeId",
	DROP COLUMN "serviceAttributeOrgServiceId",
	DROP COLUMN "userAttributeAttributeId",
	DROP COLUMN "userAttributeUserId",
	ALTER COLUMN "attributeId" SET NOT NULL;

-- DropTable
DROP TABLE "LocationAttribute";

-- DropTable
DROP TABLE "OrganizationAttribute";

-- DropTable
DROP TABLE "ServiceAccessAttribute";

-- DropTable
DROP TABLE "ServiceAttribute";

-- DropTable
DROP TABLE "UserAttribute";

-- CreateIndex
CREATE INDEX "AttributeSupplement_attributeId_idx" ON
 "AttributeSupplement"("attributeId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_attributeId_locationId_idx" ON
 "AttributeSupplement"("attributeId", "locationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_attributeId_organizationId_idx" ON
 "AttributeSupplement"("attributeId", "organizationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_attributeId_serviceId_idx" ON
 "AttributeSupplement"("attributeId", "serviceId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_attributeId_userId_idx" ON
 "AttributeSupplement"("attributeId", "userId");

-- AddForeignKey
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_attributeId_fkey" FOREIGN KEY
	("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON
	UPDATE CASCADE;

-- Add custom constraint to AttributeSupplement table
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_attached_records_CUSTOM" CHECK
	(num_nonnulls("locationId", "organizationId", "serviceId", "userId") =
	1);
