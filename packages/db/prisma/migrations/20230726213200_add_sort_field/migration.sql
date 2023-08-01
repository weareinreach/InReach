/*
  Warnings:

  - A unique constraint covering the columns `[crisisResourceSort]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "crisisResourceSort" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_crisisResourceSort_key" ON "Organization"("crisisResourceSort");
