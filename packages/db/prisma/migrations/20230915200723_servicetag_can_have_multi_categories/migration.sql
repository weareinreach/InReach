-- DropForeignKey
ALTER TABLE "ServiceTag"
	DROP CONSTRAINT "ServiceTag_categoryId_fkey";

-- DropIndex
DROP INDEX "ServiceTag_categoryId_idx";

-- DropIndex
DROP INDEX "ServiceTag_name_categoryId_key";

-- CreateTable
CREATE TABLE "ServiceTagToCategory"(
	"categoryId" text NOT NULL,
	"serviceTagId" text NOT NULL,
	"linkedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"active" boolean NOT NULL DEFAULT TRUE,
	CONSTRAINT "ServiceTagToCategory_pkey" PRIMARY KEY ("categoryId", "serviceTagId")
);

SELECT
	audit_trail_enable(to_regclass('public."ServiceTagToCategory"'));

-- Copy data in to new table
INSERT INTO "ServiceTagToCategory"("categoryId", "serviceTagId")
SELECT
	"categoryId",
	"id"
FROM
	"ServiceTag";

-- AlterTable
ALTER TABLE "ServiceTag"
	ADD COLUMN "primaryCategoryId" TEXT;

-- Copy data over to new column
UPDATE
	"ServiceTag"
SET
	"primaryCategoryId" = "categoryId";

ALTER TABLE "ServiceTag"
	ALTER COLUMN "primaryCategoryId" SET NOT NULL;

ALTER TABLE "ServiceTag"
	DROP COLUMN "categoryId";

-- CreateIndex
CREATE INDEX "ServiceTag_primaryCategoryId_idx" ON "ServiceTag"("primaryCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_name_primaryCategoryId_key" ON
 "ServiceTag"("name", "primaryCategoryId");

-- AddForeignKey
ALTER TABLE "ServiceTag"
	ADD CONSTRAINT "ServiceTag_primaryCategoryId_fkey" FOREIGN KEY
	("primaryCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE
	RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTagToCategory"
	ADD CONSTRAINT "ServiceTagToCategory_categoryId_fkey" FOREIGN KEY
	("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTagToCategory"
	ADD CONSTRAINT "ServiceTagToCategory_serviceTagId_fkey" FOREIGN KEY
	("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON
	UPDATE CASCADE;
