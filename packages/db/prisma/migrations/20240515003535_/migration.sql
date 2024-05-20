/*
  Warnings:

  - The values [INFO,WARN,CRITICAL] on the enum `LocationAlertLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LocationAlertLevel_new" AS ENUM ('INFO_PRIMARY', 'WARN_PRIMARY', 'CRITICAL_PRIMARY', 'INFO_SECONDARY', 'WARN_SECONDARY', 'CRITICAL_SECONDARY');
ALTER TABLE "LocationAlert" ALTER COLUMN "level" TYPE "LocationAlertLevel_new" USING ("level"::text::"LocationAlertLevel_new");
ALTER TYPE "LocationAlertLevel" RENAME TO "LocationAlertLevel_old";
ALTER TYPE "LocationAlertLevel_new" RENAME TO "LocationAlertLevel";
DROP TYPE "LocationAlertLevel_old";
COMMIT;

