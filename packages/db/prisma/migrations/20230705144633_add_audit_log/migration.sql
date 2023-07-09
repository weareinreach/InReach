-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "slugRedirectId" TEXT;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_slugRedirectId_fkey" FOREIGN KEY ("slugRedirectId") REFERENCES "SlugRedirect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
