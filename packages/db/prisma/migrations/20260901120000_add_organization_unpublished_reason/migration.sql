-- CreateEnum
-- First-pass values, pending final sign-off from Abby Davies - see
-- docs/DataPortal/2026-Redesign/unpublished-status.md. INACTIVE/UNAFFIRMING are terminal
-- classifications, not workflow steps, so this is deliberately not ticket-status vocabulary.
CREATE TYPE "OrgUnpublishedReason" AS ENUM ('NEW', 'IN_PROGRESS', 'WAITING', 'INACTIVE', 'UNAFFIRMING');

-- AlterTable
-- Nullable, no default - NULL means "published" or "predates this feature." Defaulting to a real
-- value would incorrectly claim every pre-existing unpublished organization has a known reason.
ALTER TABLE "Organization"
	ADD COLUMN "unpublishedReason" "OrgUnpublishedReason";
