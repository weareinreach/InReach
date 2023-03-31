-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "activeForOrgs" BOOLEAN;

-- CreateTable
CREATE TABLE "AttributeNesting" (
    "childId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttributeNesting_pkey" PRIMARY KEY ("parentId","childId")
);

-- AddForeignKey
ALTER TABLE "AttributeNesting" ADD CONSTRAINT "AttributeNesting_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeNesting" ADD CONSTRAINT "AttributeNesting_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
