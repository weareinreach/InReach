/*
  Warnings:

  - Added the required column `operation` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditLogOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "operation" "AuditLogOperation" NOT NULL,
ADD COLUMN     "translatedReviewId" TEXT;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_translatedReviewId_fkey" FOREIGN KEY ("translatedReviewId") REFERENCES "TranslatedReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
