/*
  Warnings:

  - You are about to drop the column `geo` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `geoJSON` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `geoWKT` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `geo` on the `GovDist` table. All the data in the column will be lost.
  - You are about to drop the column `geoJSON` on the `GovDist` table. All the data in the column will be lost.
  - You are about to drop the column `geoWKT` on the `GovDist` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Country_geo_idx";

-- DropIndex
DROP INDEX "GovDist_geo_idx";

-- AlterTable
ALTER TABLE "Country" DROP COLUMN "geo",
DROP COLUMN "geoJSON",
DROP COLUMN "geoWKT";

-- AlterTable
ALTER TABLE "GovDist" DROP COLUMN "geo",
DROP COLUMN "geoJSON",
DROP COLUMN "geoWKT";
