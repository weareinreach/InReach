/*
 Warnings:

 - A unique constraint covering the columns `[defaultSort]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
 */
-- AlterTable
ALTER TABLE "Language"
	ADD COLUMN "defaultSort" INTEGER,
	ADD COLUMN "groupCommon" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "Language_defaultSort_key" ON "Language"("defaultSort");
