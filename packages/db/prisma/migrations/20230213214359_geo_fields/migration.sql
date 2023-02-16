-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "geo" "public".geography,
ADD COLUMN     "geoWKT" TEXT;

-- AlterTable
ALTER TABLE "GovDist" ADD COLUMN     "geo" "public".geography,
ADD COLUMN     "geoWKT" TEXT;

-- AlterTable
ALTER TABLE "OrgLocation" ADD COLUMN     "geo" "public".geography,
ADD COLUMN     "geoWKT" TEXT;

-- CreateIndex
CREATE INDEX "Country_geo_idx" ON "Country" USING SPGIST ("geo");

-- CreateIndex
CREATE INDEX "GovDist_geo_idx" ON "GovDist" USING SPGIST ("geo");

-- CreateIndex
CREATE INDEX "OrgLocation_geo_idx" ON "OrgLocation" USING SPGIST ("geo");
