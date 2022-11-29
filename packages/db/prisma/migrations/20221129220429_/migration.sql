/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Attribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `AttributeCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tag]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tag` to the `UserRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "tag" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "Attribute"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_name_key" ON "AttributeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_tag_key" ON "UserRole"("tag");
