/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,name]` on the table `Attribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `AttributeCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "requireSupplemental" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InternalNote" ADD COLUMN     "attributeSupplementId" TEXT;

-- CreateTable
CREATE TABLE "AttributeSupplement" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "attributeId" TEXT NOT NULL,
    "organizationId" TEXT,
    "serviceId" TEXT,
    "locationId" TEXT,
    "serviceTagId" TEXT,
    "serviceCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "AttributeSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_categoryId_name_key" ON "Attribute"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeCategory_name_key" ON "AttributeCategory"("name");

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_attributeSupplementId_fkey" FOREIGN KEY ("attributeSupplementId") REFERENCES "AttributeSupplement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
