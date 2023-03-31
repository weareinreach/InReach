/*
  Warnings:

  - A unique constraint covering the columns `[jobId]` on the table `DataMigration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `DataMigration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataMigration" ADD COLUMN     "jobId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DataMigration_jobId_key" ON "DataMigration"("jobId");
