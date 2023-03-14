/*
  Warnings:

  - A unique constraint covering the columns `[descriptionId]` on the table `OrgLocation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrgLocation" ADD COLUMN     "descriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrgLocation_descriptionId_key" ON "OrgLocation"("descriptionId");

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "FreeText"("id") ON DELETE SET NULL ON UPDATE CASCADE;
