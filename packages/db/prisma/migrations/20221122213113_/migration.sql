/*
  Warnings:

  - You are about to drop the column `primary` on the `Language` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Language" DROP COLUMN "primary",
ADD COLUMN     "activelyTranslated" BOOLEAN NOT NULL DEFAULT false;
