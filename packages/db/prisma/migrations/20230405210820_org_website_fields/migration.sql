-- AlterTable
ALTER TABLE
	"OrgWebsite"
ADD
	COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD
	COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
