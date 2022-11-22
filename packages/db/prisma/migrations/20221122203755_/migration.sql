/*
  Warnings:

  - You are about to drop the column `type` on the `ServiceTag` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `UserTitle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category]` on the table `ServiceCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,categoryId]` on the table `ServiceTag` will be added. If there are existing duplicate values, this will fail.
  - Made the column `href` on table `FooterLink` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `ServiceTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `UserTitle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FooterLink" ALTER COLUMN "href" SET NOT NULL;

-- AlterTable
ALTER TABLE "InternalNote" ADD COLUMN     "propertyAttributeId" TEXT,
ADD COLUMN     "propertyCategoryId" TEXT;

-- AlterTable
ALTER TABLE "ServiceTag" DROP COLUMN "type",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserTitle" DROP COLUMN "text",
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AttributeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "namespaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "AttributeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "keyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AttributeToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToOrgLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToOrgService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToServiceCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToServiceTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrganization_AB_unique" ON "_AttributeToOrganization"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrganization_B_index" ON "_AttributeToOrganization"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrgLocation_AB_unique" ON "_AttributeToOrgLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrgLocation_B_index" ON "_AttributeToOrgLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToOrgService_AB_unique" ON "_AttributeToOrgService"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToOrgService_B_index" ON "_AttributeToOrgService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToServiceCategory_AB_unique" ON "_AttributeToServiceCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToServiceCategory_B_index" ON "_AttributeToServiceCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToServiceTag_AB_unique" ON "_AttributeToServiceTag"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToServiceTag_B_index" ON "_AttributeToServiceTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_category_key" ON "ServiceCategory"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_name_categoryId_key" ON "ServiceTag"("name", "categoryId");

-- AddForeignKey
ALTER TABLE "AttributeCategory" ADD CONSTRAINT "AttributeCategory_namespaceId_fkey" FOREIGN KEY ("namespaceId") REFERENCES "TranslationNamespace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeCategory" ADD CONSTRAINT "AttributeCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeCategory" ADD CONSTRAINT "AttributeCategory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AttributeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_propertyCategoryId_fkey" FOREIGN KEY ("propertyCategoryId") REFERENCES "AttributeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_propertyAttributeId_fkey" FOREIGN KEY ("propertyAttributeId") REFERENCES "Attribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrganization" ADD CONSTRAINT "_AttributeToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrganization" ADD CONSTRAINT "_AttributeToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgLocation" ADD CONSTRAINT "_AttributeToOrgLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgLocation" ADD CONSTRAINT "_AttributeToOrgLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgService" ADD CONSTRAINT "_AttributeToOrgService_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToOrgService" ADD CONSTRAINT "_AttributeToOrgService_B_fkey" FOREIGN KEY ("B") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceCategory" ADD CONSTRAINT "_AttributeToServiceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceCategory" ADD CONSTRAINT "_AttributeToServiceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceTag" ADD CONSTRAINT "_AttributeToServiceTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToServiceTag" ADD CONSTRAINT "_AttributeToServiceTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
