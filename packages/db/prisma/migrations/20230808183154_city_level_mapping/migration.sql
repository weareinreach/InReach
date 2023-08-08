-- AlterTable
ALTER TABLE "OrgLocation"
	ADD COLUMN "mapCityOnly" BOOLEAN,
	ALTER COLUMN "street1" DROP NOT NULL;

