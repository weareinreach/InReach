/*
  Warnings:

  - You are about to drop the column `parentKey` on the `TranslationKey` table. All the data in the column will be lost.
  - You are about to drop the column `parentNs` on the `TranslationKey` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('INCLUDE', 'EXCLUDE');

-- CreateEnum
CREATE TYPE "TranslationPlurals" AS ENUM ('SINGLE', 'PLURAL', 'ORDINAL', 'INTERVAL');

-- DropForeignKey
ALTER TABLE "TranslationKey" DROP CONSTRAINT "TranslationKey_parentKey_parentNs_fkey";

-- DropIndex
DROP INDEX "TranslationKey_parentKey_parentNs_key";

-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "filterType" "FilterType";

-- AlterTable
ALTER TABLE "TranslationKey" DROP COLUMN "parentKey",
DROP COLUMN "parentNs",
ADD COLUMN     "plural" "TranslationPlurals" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "pluralValues" JSONB;
