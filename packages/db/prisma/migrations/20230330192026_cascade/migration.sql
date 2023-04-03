-- DropForeignKey
ALTER TABLE "AttributeNesting" DROP CONSTRAINT "AttributeNesting_childId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeNesting" DROP CONSTRAINT "AttributeNesting_parentId_fkey";

-- AddForeignKey
ALTER TABLE "AttributeNesting" ADD CONSTRAINT "AttributeNesting_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeNesting" ADD CONSTRAINT "AttributeNesting_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
