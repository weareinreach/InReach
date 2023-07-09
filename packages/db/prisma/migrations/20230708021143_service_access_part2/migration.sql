/*
 Warnings:

 - You are about to drop the column `serviceAccessAttributeServiceAccessId` on the `AttributeSupplement` table. All the data in the column will be lost.
 - You are about to drop the column `serviceAccessId` on the `AuditLog` table. All the data in the column will be lost.
 - You are about to drop the column `serviceAccessId` on the `InternalNote` table. All the data in the column will be lost.
 - The primary key for the `ServiceAccessAttribute` table will be changed. If it partially fails, the table could be left without primary key constraint.
 - You are about to drop the column `serviceAccessId` on the `ServiceAccessAttribute` table. All the data in the column will be lost.
 - You are about to drop the `ServiceAccess` table. If the table is not empty, all the data it contains will be lost.
 - Made the column `serviceId` on table `ServiceAccessAttribute` required. This step will fail if there are existing NULL values in that column.
 */
-- DropForeignKey
ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_serviceAccessAttributeAttributeId_serv_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog"
	DROP CONSTRAINT "AuditLog_serviceAccessId_fkey";

-- DropForeignKey
ALTER TABLE "InternalNote"
	DROP CONSTRAINT "InternalNote_serviceAccessId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccess"
	DROP CONSTRAINT "ServiceAccess_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAccessAttribute"
	DROP CONSTRAINT "ServiceAccessAttribute_serviceAccessId_fkey";

-- DropIndex
DROP INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx";

-- AlterTable
ALTER TABLE "AttributeSupplement"
	DROP COLUMN "serviceAccessAttributeServiceAccessId";

-- AlterTable
ALTER TABLE "AuditLog"
	DROP COLUMN "serviceAccessId";

-- AlterTable
ALTER TABLE "InternalNote"
	DROP COLUMN "serviceAccessId";

DELETE FROM "ServiceAccessAttribute"
WHERE "serviceId" IS NULL;

-- AlterTable
ALTER TABLE "ServiceAccessAttribute"
	DROP CONSTRAINT "ServiceAccessAttribute_pkey",
	DROP COLUMN "serviceAccessId",
	ALTER COLUMN "serviceId" SET NOT NULL,
	ADD CONSTRAINT "ServiceAccessAttribute_pkey" PRIMARY KEY ("serviceId", "attributeId");

-- DropTable
DROP TABLE "ServiceAccess";

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceAccessAttributeAttributeId_servi_idx" ON "AttributeSupplement"("serviceAccessAttributeAttributeId", "serviceAccessAttributeServiceId", "id");

-- AddForeignKey
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_serviceAccessAttributeAttributeId_serv_fkey" FOREIGN KEY ("serviceAccessAttributeAttributeId", "serviceAccessAttributeServiceId") REFERENCES "ServiceAccessAttribute"("attributeId", "serviceId") ON DELETE CASCADE ON UPDATE CASCADE;

