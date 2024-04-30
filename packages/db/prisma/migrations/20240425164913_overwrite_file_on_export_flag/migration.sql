-- AlterTable
ALTER TABLE "TranslationNamespace"
	ADD COLUMN "overwriteFileOnExport" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE
	"TranslationNamespace" ns
SET
	"overwriteFileOnExport" = TRUE
WHERE
	ns.name != 'common'
