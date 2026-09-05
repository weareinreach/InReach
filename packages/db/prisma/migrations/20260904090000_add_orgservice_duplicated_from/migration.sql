-- AlterTable
ALTER TABLE "OrgService" ADD COLUMN "duplicatedFromId" TEXT;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_duplicatedFromId_fkey"
  FOREIGN KEY ("duplicatedFromId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "OrgService_duplicatedFromId_idx" ON "OrgService"("duplicatedFromId");
