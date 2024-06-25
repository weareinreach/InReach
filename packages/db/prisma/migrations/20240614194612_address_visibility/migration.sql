/*
 Warnings:

 - You are about to drop the column `mapCityOnly` on the `OrgLocation` table. All the data in the column will be lost.
 - You are about to drop the column `notVisitable` on the `OrgLocation` table. All the data in the column will be lost.
 - Made the column `city` on table `OrgLocation` required. This step will fail if there are existing NULL values in that column.
 */
-- CreateEnum
CREATE TYPE "AddressVisibility" AS ENUM(
	'FULL',
	'PARTIAL',
	'HIDDEN'
);

-- AlterTable
ALTER TABLE "OrgLocation"
	ADD COLUMN "addressVisibility" "AddressVisibility" NOT NULL DEFAULT 'FULL';

UPDATE
	"OrgLocation"
SET
	"addressVisibility" = 'HIDDEN'
WHERE
	"notVisitable";

ALTER TABLE "OrgLocation"
	DROP COLUMN "mapCityOnly",
	DROP COLUMN "notVisitable",
	ALTER COLUMN "city" SET NOT NULL;
