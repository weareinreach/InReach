-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "requireCountry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireLanguage" BOOLEAN NOT NULL DEFAULT false;
