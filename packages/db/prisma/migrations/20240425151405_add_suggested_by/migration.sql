/*
 Warnings:

 - Made the column `organizationId` on table `Suggestion` required. This step will fail if there are existing NULL values in that column.
 */
-- DropForeignKey
ALTER TABLE "Suggestion"
	DROP CONSTRAINT "Suggestion_organizationId_fkey";

-- AlterTable
ALTER TABLE "Suggestion"
	ADD COLUMN "suggestedById" TEXT,
	ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AttributeSupplement_active_attributeId_idx" ON
 "AttributeSupplement"("active", "attributeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgLocationService_active_serviceId_idx" ON
 "OrgLocationService"("active", "serviceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrgService_organizationId_published_deleted_idx" ON
 "OrgService"("organizationId", "published" DESC, "deleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceArea_active_organizationId_idx" ON
 "ServiceArea"("active", "organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgLocationId_idx" ON
 "ServiceArea"("active", "orgLocationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceArea_active_orgServiceId_idx" ON
 "ServiceArea"("active", "orgServiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaCountry_active_serviceAreaId_idx" ON
 "ServiceAreaCountry"("active", "serviceAreaId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaDist_active_serviceAreaId_idx" ON
 "ServiceAreaDist"("active", "serviceAreaId");

-- AddForeignKey
ALTER TABLE "Suggestion"
	ADD CONSTRAINT "Suggestion_organizationId_fkey" FOREIGN KEY
	("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT
	ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion"
	ADD CONSTRAINT "Suggestion_suggestedById_fkey" FOREIGN KEY
	("suggestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE
	CASCADE;
