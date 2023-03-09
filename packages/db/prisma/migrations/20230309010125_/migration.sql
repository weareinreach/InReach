-- AlterEnum
ALTER TYPE "TranslationPlurals"
ADD
	VALUE 'CONTEXT';

-- AlterTable
ALTER TABLE
	"Attribute"
ADD
	COLUMN "showOnLocation" BOOLEAN;

-- AlterTable
ALTER TABLE
	"OrgHours"
ALTER COLUMN
	"start"
SET
	DATA TYPE TIMETZ(0),
ALTER COLUMN
	"end"
SET
	DATA TYPE TIMETZ(0);