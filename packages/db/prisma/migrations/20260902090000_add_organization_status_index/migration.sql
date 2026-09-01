-- CreateIndex
-- Speeds up the Organizations table's Status filter, which always queries `published` AND
-- `unpublishedReason` together (see statusWhere/statusSqlCondition in
-- query.forOrganizationTable.handler.ts) - matches the existing [published, deleted] composite index
-- already on this table for the same reason.
CREATE INDEX "Organization_published_unpublishedReason_idx" ON "Organization"("published", "unpublishedReason");
