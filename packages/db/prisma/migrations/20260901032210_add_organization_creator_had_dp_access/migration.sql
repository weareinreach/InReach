-- AlterTable
-- Nullable, no default - NULL means "predates this feature" or "not applicable" (only meaningfully set
-- for orgs created via the public suggestion form or the Data Portal's Add Org modal going forward).
-- Defaulting to FALSE would incorrectly claim every pre-existing organization was publicly submitted.
ALTER TABLE "Organization"
	ADD COLUMN "creatorHadDpAccess" BOOLEAN;
