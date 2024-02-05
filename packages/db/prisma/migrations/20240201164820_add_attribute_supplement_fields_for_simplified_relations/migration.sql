-- AlterTable
ALTER TABLE "AttributeSupplement"
	ADD COLUMN "attributeId" TEXT,
	ADD COLUMN "locationId" TEXT,
	ADD COLUMN "organizationId" TEXT,
	ADD COLUMN "serviceId" TEXT,
	ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "AttributeSupplement_locationId_idx" ON
 "AttributeSupplement"("locationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_organizationId_idx" ON
 "AttributeSupplement"("organizationId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_serviceId_idx" ON "AttributeSupplement"("serviceId");

-- CreateIndex
CREATE INDEX "AttributeSupplement_userId_idx" ON "AttributeSupplement"("userId");

-- AddForeignKey
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_attributeId_fkey" FOREIGN KEY
	("attributeId") REFERENCES "Attribute"("id") ON DELETE SET NULL ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_locationId_fkey" FOREIGN KEY
	("locationId") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_organizationId_fkey" FOREIGN KEY
	("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_serviceId_fkey" FOREIGN KEY
	("serviceId") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE
	CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_userId_fkey" FOREIGN KEY ("userId")
	REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE
	"AttributeSupplement"
SET
	"locationId" = "locationAttributeLocationId",
	"attributeId" = "locationAttributeAttributeId"
WHERE
	"locationAttributeAttributeId" IS NOT NULL
	AND "locationAttributeLocationId" IS NOT NULL;

UPDATE
	"AttributeSupplement"
SET
	"organizationId" = "organizationAttributeOrganizationId",
	"attributeId" = "organizationAttributeAttributeId"
WHERE
	"organizationAttributeAttributeId" IS NOT NULL
	AND "organizationAttributeOrganizationId" IS NOT NULL;

UPDATE
	"AttributeSupplement"
SET
	"serviceId" = "serviceAccessAttributeServiceId",
	"attributeId" = "serviceAccessAttributeAttributeId"
WHERE
	"serviceAccessAttributeAttributeId" IS NOT NULL
	AND "serviceAccessAttributeServiceId" IS NOT NULL;

UPDATE
	"AttributeSupplement"
SET
	"serviceId" = "serviceAttributeOrgServiceId",
	"attributeId" = "serviceAttributeAttributeId"
WHERE
	"serviceAttributeAttributeId" IS NOT NULL
	AND "serviceAttributeOrgServiceId" IS NOT NULL;

UPDATE
	"AttributeSupplement"
SET
	"userId" = "userAttributeUserId",
	"attributeId" = "userAttributeAttributeId"
WHERE
	"userAttributeAttributeId" IS NOT NULL
	AND "userAttributeUserId" IS NOT NULL;
