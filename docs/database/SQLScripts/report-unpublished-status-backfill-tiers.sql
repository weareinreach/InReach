-- READ-ONLY report. No UPDATE, no side effects - run freely, as many times as you like.
--
-- This is a manual-triage worklist, not an auto-backfill tool. Earlier attempts at this script tried to
-- auto-classify orgs by evidence tier (e.g. "never verified" -> NEW) - that broke the moment we noticed a
-- 2-year-old never-verified org isn't "new," it's neglected. Nothing in the schema actually captures WHY
-- an org is unpublished historically (no InternalNote content on these orgs, only a small fraction have
-- a recoverable published:true->false audit transition, and even that only gives who/when, not why) - so
-- a person still has to look at each one and decide. What this script CAN do is group orgs by what's
-- actually knowable about them, so a reviewer isn't starting from an unsorted list of 1,400+ rows.
--
-- Groups (context for the reviewer's judgment, not a suggested answer):
--   1a - Never verified, not deleted, created within the last NEW_WINDOW_DAYS. Plausibly genuinely new.
--   1b - Never verified, not deleted, created longer ago. Something's stuck - worth a first look.
--   2  - Never verified, but soft-deleted. Likely rejected at intake (spam/duplicate/invalid).
--   3  - Previously verified, then soft-deleted. Was live at some point, then staff ended it - the
--        group most likely to be Inactive or Unaffirming, but which one still needs a human call.
--   4  - Previously verified, still unpublished, never deleted. The least-signal group - ordered oldest
--        `updatedAt` first, since those are the safest/lowest-risk to make a first pass on.
--
-- "Undetermined" as an actual stored value is not implemented here - it isn't in the OrgUnpublishedReason
-- enum today, adding it is a real schema change, and that's explicitly pending a follow-up decision with
-- the team before any backfill runs.
--
-- NEW_WINDOW_DAYS (currently 30) is a judgment call, not a measured value - adjust to match how long an
-- org realistically sits before triage actually starts in practice.

WITH tiered AS (
	SELECT
		o.id,
		o.name,
		concat('https://app.inreach.org/org/', o.slug, '/edit') AS edit_url,
		o.deleted,
		o."createdAt",
		o."lastVerified",
		o."updatedAt",
		CASE
			WHEN o."lastVerified" IS NULL AND o.deleted = false AND o."createdAt" >= now() - interval '30 days'
				THEN '1a - Never verified, not deleted, created <30d ago'
			WHEN o."lastVerified" IS NULL AND o.deleted = false
				THEN '1b - Never verified, not deleted, created 30d+ ago'
			WHEN o."lastVerified" IS NULL AND o.deleted = true THEN '2 - Never verified, deleted'
			WHEN o."lastVerified" IS NOT NULL AND o.deleted = true THEN '3 - Previously verified, deleted'
			ELSE '4 - Previously verified, still unpublished, never deleted'
		END AS tier
	FROM "Organization" o
	WHERE o.published = false
		AND o."unpublishedReason" IS NULL
)

-- 1. Summary with a quick ASCII bar - run this first, just to see the overall scale.
SELECT
	tier,
	count(*) AS orgs,
	repeat('█', greatest(1, (count(*) / greatest((SELECT count(*) FROM tiered) / 40, 1))::int)) AS bar
FROM tiered
GROUP BY tier
ORDER BY tier;

-- 2. The actual worklist - one row per org, oldest-updated first within each tier so a reviewer works
-- through the lowest-risk/most-neglected ones first. Click `edit_url` to open the org and set its status
-- via the real Set Status control. (A `WITH` clause only scopes to the one statement it's attached to,
-- so `tiered` is redefined here rather than reused from query 1 above.)
WITH tiered AS (
	SELECT
		o.id,
		o.name,
		concat('https://app.inreach.org/org/', o.slug, '/edit') AS edit_url,
		o.deleted,
		o."createdAt",
		o."lastVerified",
		o."updatedAt",
		CASE
			WHEN o."lastVerified" IS NULL AND o.deleted = false AND o."createdAt" >= now() - interval '30 days'
				THEN '1a - Never verified, not deleted, created <30d ago'
			WHEN o."lastVerified" IS NULL AND o.deleted = false
				THEN '1b - Never verified, not deleted, created 30d+ ago'
			WHEN o."lastVerified" IS NULL AND o.deleted = true THEN '2 - Never verified, deleted'
			WHEN o."lastVerified" IS NOT NULL AND o.deleted = true THEN '3 - Previously verified, deleted'
			ELSE '4 - Previously verified, still unpublished, never deleted'
		END AS tier
	FROM "Organization" o
	WHERE o.published = false
		AND o."unpublishedReason" IS NULL
)
SELECT id, name, edit_url, deleted, "createdAt", "lastVerified", "updatedAt", tier
FROM tiered
ORDER BY tier, "updatedAt" ASC;
