-- AlterTable
ALTER TABLE "Country"
	ADD COLUMN "articlePrefix" BOOLEAN;

UPDATE
	"Country" c
SET
	"articlePrefix" = TRUE
WHERE
	c.cca2 IN ('AE', 'AN', 'AX', 'BQ', 'BS', 'CC', 'CD', 'CF', 'CG', 'CI', 'CK', 'DO', 'FK', 'GB', 'GM', 'HM', 'IM', 'IO', 'KM', 'KY', 'MH', 'MP', 'MV', 'NL', 'PH', 'PN', 'SB', 'SC', 'TC', 'TF', 'UM', 'US', 'VG', 'VI');

