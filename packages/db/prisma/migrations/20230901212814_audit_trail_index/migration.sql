-- DropIndex
DROP INDEX "AuditTrail_recordId_idx";

-- DropIndex
DROP INDEX "AuditTrail_timestamp_idx";

-- AlterTable
ALTER TABLE "AuditTrail"
	ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX "AuditTrail_recordId_idx" ON "AuditTrail" USING GIN("recordId");

-- CreateIndex
CREATE INDEX "AuditTrail_timestamp_idx" ON "AuditTrail" USING BRIN("timestamp");
