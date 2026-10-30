-- Reconcile pre-existing drift before adding this migration's own schema changes. `prisma migrate dev`
-- refuses to generate or apply anything while drift exists between migration history and the actual DB, so
-- these two items (unrelated to the feature below) have to be resolved in the same migration that's finally
-- allowed through.
--
-- 1. SearchSynonym was already present in schema.prisma and in at least one real database, but no migration
-- anywhere ever created it - it was evidently added via `prisma db push` at some point. `IF NOT EXISTS` makes
-- this safe both for a database that already has it (a no-op) and one that doesn't (creates it for real).
CREATE TABLE IF NOT EXISTS "SearchSynonym" (
    "id" TEXT NOT NULL,
    "terms" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchSynonym_pkey" PRIMARY KEY ("id")
);

-- 2. schema.prisma has specified `onDelete: Cascade` on InternalNote.user since that relation was added,
-- but the original migration (202500808214500_add_userId_column_internal_note) only created a plain FK with
-- no cascade behavior at all. Some databases already have the cascade applied directly (matching
-- schema.prisma, but not migration history); this makes it official and consistent everywhere.
ALTER TABLE "InternalNote" DROP CONSTRAINT IF EXISTS "InternalNote_userId_fkey";
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Org URL Duplicate Check Exceptions feature - generated via `prisma migrate diff` against schema.prisma,
-- not hand-written.

-- AlterTable
ALTER TABLE "InternalNote" ADD COLUMN     "orgUrlDuplicateExceptionId" TEXT;

-- CreateTable
CREATE TABLE "OrgUrlDuplicateException" (
    "id" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgUrlDuplicateException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgUrlDuplicateException_baseUrl_key" ON "OrgUrlDuplicateException"("baseUrl");

-- CreateIndex
CREATE INDEX "OrgUrlDuplicateException_baseUrl_idx" ON "OrgUrlDuplicateException"("baseUrl");

-- AddForeignKey
ALTER TABLE "OrgUrlDuplicateException" ADD CONSTRAINT "OrgUrlDuplicateException_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgUrlDuplicateExceptionId_fkey" FOREIGN KEY ("orgUrlDuplicateExceptionId") REFERENCES "OrgUrlDuplicateException"("id") ON DELETE CASCADE ON UPDATE CASCADE;
