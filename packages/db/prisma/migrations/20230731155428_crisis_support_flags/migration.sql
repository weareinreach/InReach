-- AlterTable
ALTER TABLE "OrgService" ADD COLUMN     "crisisSupportOnly" BOOLEAN;

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "crisisSupportOnly" BOOLEAN;

-- AlterTable
ALTER TABLE "ServiceTag" ADD COLUMN     "crisisSupportOnly" BOOLEAN;
