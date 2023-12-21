/*
 Warnings:

 - Made the column `mailOnly` on table `OrgLocation` required. This step will fail if there are existing NULL values in that column.
 - Made the column `mapCityOnly` on table `OrgLocation` required. This step will fail if there are existing NULL values in that column.
 - Made the column `notVisitable` on table `OrgLocation` required. This step will fail if there are existing NULL values in that column.
 */
-- Update values for Location
UPDATE
	"OrgLocation"
SET
	"mailOnly" = FALSE
WHERE
	"mailOnly" IS NULL;

UPDATE
	"OrgLocation"
SET
	"mapCityOnly" = FALSE
WHERE
	"mapCityOnly" IS NULL;

UPDATE
	"OrgLocation"
SET
	"notVisitable" = FALSE
WHERE
	"notVisitable" IS NULL;

-- AlterTable
ALTER TABLE "OrgLocation"
	ALTER COLUMN "mailOnly" SET NOT NULL,
	ALTER COLUMN "mailOnly" SET DEFAULT FALSE,
	ALTER COLUMN "mapCityOnly" SET NOT NULL,
	ALTER COLUMN "mapCityOnly" SET DEFAULT FALSE,
	ALTER COLUMN "notVisitable" SET NOT NULL,
	ALTER COLUMN "notVisitable" SET DEFAULT FALSE;
