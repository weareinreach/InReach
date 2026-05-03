-- CreateEnum
CREATE TYPE "ReportIssueType" AS ENUM ('CLOSED_INACTIVE', 'INCORRECT_INFO', 'TRANSLATION_QUALITY', 'SOMETHING_ELSE');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orgNameSnapshot" TEXT,
    "serviceId" TEXT,
    "serviceNameSnapshot" TEXT,
    "issueType" "ReportIssueType" NOT NULL,
    "incorrectFields" TEXT[],
    "languageId" TEXT,
    "note" TEXT,
    "reportedById" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "informed" BOOLEAN NOT NULL DEFAULT false,
    "handledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_organizationId_idx" ON "Report"("organizationId");
CREATE INDEX "Report_serviceId_idx" ON "Report"("serviceId");
CREATE INDEX "Report_reportedById_idx" ON "Report"("reportedById");
CREATE INDEX "Report_handledById_idx" ON "Report"("handledById");
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "Report_issueType_idx" ON "Report"("issueType");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable (Update InternalNote to link to Report)
ALTER TABLE "InternalNote" ADD COLUMN "reportId" TEXT;
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
