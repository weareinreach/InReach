-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "requiredSchemaId" TEXT;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "attributeSupplementDataSchemaId" TEXT;

-- AlterTable
ALTER TABLE "InternalNote" ADD COLUMN     "attributeSupplementDataSchemaId" TEXT;

-- CreateTable
CREATE TABLE "AttributeSupplementDataSchema" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeSupplementDataSchema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttributeSupplementDataSchema_tag_key" ON "AttributeSupplementDataSchema"("tag");

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_requiredSchemaId_fkey" FOREIGN KEY ("requiredSchemaId") REFERENCES "AttributeSupplementDataSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_attributeSupplementDataSchemaId_fkey" FOREIGN KEY ("attributeSupplementDataSchemaId") REFERENCES "AttributeSupplementDataSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_attributeSupplementDataSchemaId_fkey" FOREIGN KEY ("attributeSupplementDataSchemaId") REFERENCES "AttributeSupplementDataSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;
