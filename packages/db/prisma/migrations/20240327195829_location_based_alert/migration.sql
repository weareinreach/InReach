-- CreateTable
CREATE TABLE "LocationAlert"(
	"id" text NOT NULL,
	"active" boolean NOT NULL DEFAULT TRUE,
	"textId" text NOT NULL,
	"countryId" text,
	"govDistId" text,
	CONSTRAINT "LocationAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationAlert_countryId_textId_idx" ON
 "LocationAlert"("countryId", "textId");

-- CreateIndex
CREATE INDEX "LocationAlert_govDistId_textId_idx" ON
 "LocationAlert"("govDistId", "textId");

-- CreateIndex
CREATE INDEX "LocationAlert_active_countryId_textId_idx" ON
 "LocationAlert"("active", "countryId", "textId");

-- CreateIndex
CREATE INDEX "LocationAlert_active_govDistId_textId_idx" ON
 "LocationAlert"("active", "govDistId", "textId");

-- AddForeignKey
ALTER TABLE "LocationAlert"
	ADD CONSTRAINT "LocationAlert_textId_fkey" FOREIGN KEY ("textId")
	REFERENCES "FreeText"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationAlert"
	ADD CONSTRAINT "LocationAlert_countryId_fkey" FOREIGN KEY ("countryId")
	REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationAlert"
	ADD CONSTRAINT "LocationAlert_govDistId_fkey" FOREIGN KEY ("govDistId")
	REFERENCES "GovDist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Custom constraint
ALTER TABLE "LocationAlert"
	ADD CONSTRAINT "LocationAlert_Location_CUSTOM" CHECK
	((num_nonnulls("countryId", "govDistId") = 1));
