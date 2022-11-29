/*
  Warnings:

  - A unique constraint covering the columns `[tag]` on the table `Attribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tag]` on the table `AttributeCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[legacyId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `PermissionItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[legacyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tag` to the `Attribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `AttributeCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AttributeCategory_name_key";

-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "tag" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AttributeCategory" ADD COLUMN     "tag" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "lastVerified" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_tag_key" ON "Attribute"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_tag_key" ON "AttributeCategory"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_legacyId_key" ON "Organization"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionItem_name_key" ON "PermissionItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_legacyId_key" ON "User"("legacyId");
