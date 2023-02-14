/*
  Warnings:

  - You are about to drop the `_AuditLogEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AuditLogEntry" DROP CONSTRAINT "_AuditLogEntry_A_fkey";

-- DropForeignKey
ALTER TABLE "_AuditLogEntry" DROP CONSTRAINT "_AuditLogEntry_B_fkey";

-- DropTable
DROP TABLE "_AuditLogEntry";

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
