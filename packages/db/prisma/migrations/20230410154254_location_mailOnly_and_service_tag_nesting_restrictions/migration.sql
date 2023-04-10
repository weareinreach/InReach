-- AlterTable
ALTER TABLE
	"OrgLocation"
ADD
	COLUMN "mailOnly" BOOLEAN;

-- CreateTable
CREATE TABLE "ServiceTagCountry" (
	"countryId" TEXT NOT NULL,
	"serviceId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceTagCountry_pkey" PRIMARY KEY ("countryId", "serviceId")
);

-- CreateTable
CREATE TABLE "ServiceTagNesting" (
	"childId" TEXT NOT NULL,
	"parentId" TEXT NOT NULL,
	"linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ServiceTagNesting_pkey" PRIMARY KEY ("parentId", "childId")
);

-- AddForeignKey
ALTER TABLE
	"ServiceTagCountry"
ADD
	CONSTRAINT "ServiceTagCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceTagCountry"
ADD
	CONSTRAINT "ServiceTagCountry_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceTagNesting"
ADD
	CONSTRAINT "ServiceTagNesting_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
	"ServiceTagNesting"
ADD
	CONSTRAINT "ServiceTagNesting_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
