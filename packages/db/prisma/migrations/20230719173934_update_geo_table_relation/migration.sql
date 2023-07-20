/*
  Warnings:

  - A unique constraint covering the columns `[geoDataId]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[geoDataId]` on the table `GovDist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Country_geoDataId_key" ON "Country"("geoDataId");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_geoDataId_key" ON "GovDist"("geoDataId");
