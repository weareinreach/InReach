-- DropForeignKey
ALTER TABLE "SlugRedirect"
	DROP CONSTRAINT "SlugRedirect_orgId_fkey";

-- AddForeignKey
ALTER TABLE "SlugRedirect"
	ADD CONSTRAINT "SlugRedirect_orgId_fkey" FOREIGN KEY ("orgId")
	REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
