-- AlterTable
ALTER TABLE "OrgLocation"
	ALTER COLUMN "primary" SET DEFAULT FALSE,
	ALTER COLUMN "geoJSON" DROP NOT NULL;

