-- AlterTable
ALTER TABLE "AttributeSupplement" ADD COLUMN     "userAttributeAttributeId" TEXT,
ADD COLUMN     "userAttributeUserId" TEXT;

-- CreateTable
CREATE TABLE "UserAttribute" (
    "userId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAttribute_pkey" PRIMARY KEY ("userId","attributeId")
);

-- CreateIndex
CREATE INDEX "AttributeSupplement_userAttributeAttributeId_userAttributeU_idx" ON "AttributeSupplement"("userAttributeAttributeId", "userAttributeUserId");

-- AddForeignKey
ALTER TABLE "AttributeSupplement" ADD CONSTRAINT "AttributeSupplement_userAttributeAttributeId_userAttribute_fkey" FOREIGN KEY ("userAttributeAttributeId", "userAttributeUserId") REFERENCES "UserAttribute"("attributeId", "userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttribute" ADD CONSTRAINT "UserAttribute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttribute" ADD CONSTRAINT "UserAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
