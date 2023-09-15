-- CreateEnum
CREATE TYPE "AuditTrailOperation" AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "table" TEXT NOT NULL,
    "table_oid" OID NOT NULL,
    "recordId" TEXT[],
    "operation" "AuditTrailOperation" NOT NULL,
    "old" JSONB,
    "new" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditTrail_recordId_idx" ON "AuditTrail"("recordId");

-- CreateIndex
CREATE INDEX "AuditTrail_actorId_idx" ON "AuditTrail"("actorId");

-- CreateIndex
CREATE INDEX "AuditTrail_table_oid_idx" ON "AuditTrail"("table_oid");

-- CreateIndex
CREATE INDEX "AuditTrail_timestamp_idx" ON "AuditTrail" USING BRIN ("timestamp");
