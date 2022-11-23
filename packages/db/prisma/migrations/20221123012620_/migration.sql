/*
  Warnings:

  - You are about to drop the `UserSOG` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserToUserSOG` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[community]` on the table `UserCommunity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[status]` on the table `UserImmigration` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_translationKeyId_fkey";

-- DropForeignKey
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserSOG" DROP CONSTRAINT "_UserToUserSOG_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserSOG" DROP CONSTRAINT "_UserToUserSOG_B_fkey";

-- DropTable
DROP TABLE "UserSOG";

-- DropTable
DROP TABLE "_UserToUserSOG";

-- CreateTable
CREATE TABLE "UserSOGIdentity" (
    "id" TEXT NOT NULL,
    "identifyAs" TEXT NOT NULL,
    "translationKeyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "UserSOGIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToUserSOGIdentity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSOGIdentity_identifyAs_key" ON "UserSOGIdentity"("identifyAs");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserSOGIdentity_AB_unique" ON "_UserToUserSOGIdentity"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserSOGIdentity_B_index" ON "_UserToUserSOGIdentity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunity_community_key" ON "UserCommunity"("community");

-- CreateIndex
CREATE UNIQUE INDEX "UserImmigration_status_key" ON "UserImmigration"("status");

-- AddForeignKey
ALTER TABLE "UserSOGIdentity" ADD CONSTRAINT "UserSOGIdentity_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOGIdentity" ADD CONSTRAINT "UserSOGIdentity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOGIdentity" ADD CONSTRAINT "UserSOGIdentity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserSOGIdentity" ADD CONSTRAINT "_UserToUserSOGIdentity_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserSOGIdentity" ADD CONSTRAINT "_UserToUserSOGIdentity_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSOGIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
