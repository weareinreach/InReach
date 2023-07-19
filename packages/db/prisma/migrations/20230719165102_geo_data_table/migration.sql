-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "geoDataId" TEXT;

-- AlterTable
ALTER TABLE "GovDist" ADD COLUMN     "geoDataId" TEXT;

-- CreateTable
CREATE TABLE "GeoData" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "geo" geometry(multipolygon,4326) NOT NULL,
    "iso" TEXT NOT NULL,
    "iso2" TEXT,
    "abbrev" TEXT,
    "type" TEXT,
    "adminLevel" INTEGER NOT NULL,

    CONSTRAINT "GeoData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeoData_geo_idx" ON "GeoData" USING SPGIST ("geo");

-- CreateIndex
CREATE INDEX "GeoData_name_idx" ON "GeoData"("name");

-- CreateIndex
CREATE INDEX "GeoData_iso_idx" ON "GeoData"("iso");

-- CreateIndex
CREATE INDEX "GeoData_abbrev_idx" ON "GeoData"("abbrev");

-- CreateIndex
CREATE INDEX "GeoData_iso_abbrev_idx" ON "GeoData"("iso", "abbrev");

-- CreateIndex
CREATE INDEX "GeoData_iso_adminLevel_idx" ON "GeoData"("iso", "adminLevel");

-- CreateIndex
CREATE INDEX "Country_geoDataId_idx" ON "Country"("geoDataId");

-- CreateIndex
CREATE INDEX "GovDist_geoDataId_idx" ON "GovDist"("geoDataId");

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_geoDataId_fkey" FOREIGN KEY ("geoDataId") REFERENCES "GeoData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_geoDataId_fkey" FOREIGN KEY ("geoDataId") REFERENCES "GeoData"("id") ON DELETE SET NULL ON UPDATE CASCADE;
