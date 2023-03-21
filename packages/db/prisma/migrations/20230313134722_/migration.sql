/*
  Warnings:

  - A unique constraint covering the columns `[serviceNameId]` on the table `OrgService` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrgService" ADD COLUMN     "serviceNameId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrgService_serviceNameId_key" ON "OrgService"("serviceNameId");

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_serviceNameId_fkey" FOREIGN KEY ("serviceNameId") REFERENCES "FreeText"("id") ON DELETE SET NULL ON UPDATE CASCADE;
