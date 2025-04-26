/*
  Warnings:

  - Added the required column `createdBy` to the `InternalNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InternalNote" ADD COLUMN     "createdBy" TEXT NOT NULL;
