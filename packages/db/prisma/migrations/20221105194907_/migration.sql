/*
  Warnings:

  - Changed the type of `start` on the `OrgHours` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end` on the `OrgHours` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "GovDist" ADD COLUMN     "isPrimary" BOOLEAN DEFAULT true,
ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "OrgHours" DROP COLUMN "start",
ADD COLUMN     "start" TIME(0) NOT NULL,
DROP COLUMN "end",
ADD COLUMN     "end" TIME(0) NOT NULL;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
