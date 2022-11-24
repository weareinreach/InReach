/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `GovDist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `GovDistType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `GovDist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GovDist_iso_key";

-- AlterTable
ALTER TABLE "GovDist" ADD COLUMN     "abbrev" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "iso" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_slug_key" ON "GovDist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GovDistType_name_key" ON "GovDistType"("name");
