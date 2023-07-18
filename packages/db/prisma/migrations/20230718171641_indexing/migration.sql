-- DropIndex
DROP INDEX "OrgService_id_organizationId_idx";

-- DropIndex
DROP INDEX "OrgService_id_published_deleted_idx";

-- DropIndex
DROP INDEX "OrgService_id_serviceNameId_descriptionId_idx";

-- DropIndex
DROP INDEX "OrgService_organizationId_id_idx";

-- CreateIndex
CREATE INDEX "OrgService_published_deleted_idx" ON "OrgService"("published", "deleted");
