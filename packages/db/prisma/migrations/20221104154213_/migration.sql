-- AlterTable
ALTER TABLE "User" ADD COLUMN     "legacyHash" VARCHAR(1024),
ADD COLUMN     "legacySalt" VARCHAR(32),
ADD COLUMN     "migrateDate" TIMESTAMP(3);
