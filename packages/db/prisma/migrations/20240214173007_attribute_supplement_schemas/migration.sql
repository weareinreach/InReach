/*
 Warnings:

 - Added the required column `schema` to the `AttributeSupplementDataSchema` table without a default value. This is not possible if the table is not empty.
 */
-- AlterTable
ALTER TABLE "AttributeSupplementDataSchema"
	ADD COLUMN "schema" JSONB;

UPDATE
	"AttributeSupplementDataSchema"
SET
	"schema" = "definition";

ALTER TABLE "AttributeSupplementDataSchema"
	ALTER COLUMN "schema" SET NOT NULL;

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
