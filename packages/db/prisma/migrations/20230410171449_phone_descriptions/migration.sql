/*
 Warnings:
 
 - A unique constraint covering the columns `[descriptionId]` on the table `OrgPhone` will be added. If there are existing duplicate values, this will fail.
 
 */
-- AlterTable
ALTER TABLE
	"OrgPhone"
ADD
	COLUMN "descriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrgPhone_descriptionId_key" ON "OrgPhone"("descriptionId");

-- AddForeignKey
ALTER TABLE
	"OrgPhone"
ADD
	CONSTRAINT "OrgPhone_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "FreeText"("id") ON DELETE
SET
	NULL ON UPDATE CASCADE;