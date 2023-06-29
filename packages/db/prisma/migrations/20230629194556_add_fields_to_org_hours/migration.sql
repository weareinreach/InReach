-- AlterTable
ALTER TABLE "OrgHours" ADD COLUMN     "interval" JSONB,
ADD COLUMN     "open24hours" BOOLEAN NOT NULL DEFAULT false;
