# Unpublished Status (Dashboard)

## Overview

A manual triage worklist for organizations that are unpublished but have no `unpublishedReason` set
yet — almost entirely pre-existing orgs that predate that field
(see [`docs/DataPortal/Organizations/README.md`](../../DataPortal/Organizations/README.md)). This is
the resolution to that field's historical-backfill question: not an automated migration, because
nothing in the schema actually records _why_ an org was unpublished historically (no `InternalNote`
content on these orgs, and only a small fraction have a recoverable `published: true → false`
`AuditTrail` transition — and even that only gives who/when, not why). A person has to look at each
one and decide; this dashboard groups them by what's actually knowable so a reviewer isn't starting
from an unsorted list of 1,400+ rows.

## Access

Both procedures are `permissionedProcedure('dataPortalManager')`
(`packages/api/router/dashboard/index.ts`), matching the page-level gate exactly (`dataPortalManager`/
`dataPortalAdmin`/`root`, `has: 'some'`) — no UI/server mismatch.

## How It Works

- **UI (summary)**: [`apps/app/src/pages/dashboards/unpublished-status/index.tsx`](../../../apps/app/src/pages/dashboards/unpublished-status/index.tsx)
  — a card grid of tier counts from `dashboard.unpublishedStatusSummary`, each linking to the list
  page pre-filtered to that tier.
- **UI (list)**: [`apps/app/src/pages/dashboards/unpublished-status/list.tsx`](../../../apps/app/src/pages/dashboards/unpublished-status/list.tsx)
  renders [`UnpublishedStatusWorklistTable`](../../../packages/ui/components/dashboard/UnpublishedStatusWorklistTable.tsx)
  — deliberately mirrors `OrganizationTable.tsx`'s own conventions (server-side pagination/sorting/search,
  same `DataTable` engine) rather than being a bespoke report view. An optional `tier` prop pre-scopes
  it from the summary page's link; not a live, user-editable filter control in this first pass.
- **Row actions**: View (org page), Edit (org edit page), and the same **Set status** popover
  (`UnpublishReasonPopover`) the Organizations table uses — a reviewer can resolve what they see
  without leaving the page. `currentReason` is always passed as `null` here, since every row in this
  worklist is `unpublishedReason IS NULL` by definition.
- **Tiering logic**: [`packages/api/router/dashboard/lib/unpublishedStatusTiers.ts`](../../../packages/api/router/dashboard/lib/unpublishedStatusTiers.ts)
  — a SQL `CASE` grouping by `lastVerified`/`deleted`/`createdAt`, context for a reviewer's judgment,
  not an inferred answer:
  - **1a** — never verified, not deleted, created within the last 30 days (plausibly genuinely new)
  - **1b** — never verified, not deleted, created 30+ days ago (something's stuck)
  - **2** — never verified, soft-deleted (likely rejected at intake)
  - **3** — previously verified, then soft-deleted (was live, staff ended it — likely Inactive or
    Unaffirming, but which one still needs a human call)
  - **4** — previously verified, still unpublished, never deleted (least-signal group, ordered oldest
    `updatedAt` first as the safest first pass)
  - The 30-day window is a hardcoded judgment call, not a measured value.

## How to Use It

1. From `/dashboards`, open the **Unpublished Status** card.
2. The summary page shows a count per tier — click one to drill into that tier's list, or use the
   list page unscoped for everything.
3. In the list, use View/Edit to look at an org, or click the tag icon to open **Set status** and
   assign a real reason directly — same popover as the Organizations table.

## Known Issues / Gotchas

- **The tiering SQL is duplicated, not shared.** [`docs/Database/SQLScripts/report-unpublished-status-backfill-tiers.sql`](../../Database/SQLScripts/report-unpublished-status-backfill-tiers.sql)
  is meant to be run standalone (outside the app) for ad hoc review, and mirrors
  `unpublishedStatusTiers.ts`'s logic by hand — the two need updating together if the tiering ever
  changes; nothing enforces that they stay in sync.
- **No progress tracking.** Nothing marks a tier (or the worklist overall) as "done" — completion is
  whatever's left showing an `unpublishedReason IS NULL` row, with no separate record of review
  progress.

## Related Files

| Path                                                                                                                                                            | Purpose                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`apps/app/src/pages/dashboards/unpublished-status/index.tsx`](../../../apps/app/src/pages/dashboards/unpublished-status/index.tsx)                             | Summary page (tier counts)                                                 |
| [`apps/app/src/pages/dashboards/unpublished-status/list.tsx`](../../../apps/app/src/pages/dashboards/unpublished-status/list.tsx)                               | Drill-down list page                                                       |
| [`packages/ui/components/dashboard/UnpublishedStatusWorklistTable.tsx`](../../../packages/ui/components/dashboard/UnpublishedStatusWorklistTable.tsx)           | Table UI + row actions                                                     |
| [`packages/api/router/dashboard/index.ts`](../../../packages/api/router/dashboard/index.ts)                                                                     | tRPC route registration + permission gate                                  |
| [`packages/api/router/dashboard/query.unpublishedStatusSummary.handler.ts`](../../../packages/api/router/dashboard/query.unpublishedStatusSummary.handler.ts)   | Tier counts query                                                          |
| [`packages/api/router/dashboard/query.unpublishedStatusWorklist.handler.ts`](../../../packages/api/router/dashboard/query.unpublishedStatusWorklist.handler.ts) | Paginated/sorted/searched worklist query                                   |
| [`packages/api/router/dashboard/lib/unpublishedStatusTiers.ts`](../../../packages/api/router/dashboard/lib/unpublishedStatusTiers.ts)                           | Tier `CASE` SQL, shared by both dashboard queries                          |
| [`docs/Database/SQLScripts/report-unpublished-status-backfill-tiers.sql`](../../Database/SQLScripts/report-unpublished-status-backfill-tiers.sql)               | Standalone ad hoc version of the same tiering logic                        |
| [`packages/ui/components/core/UnpublishReasonPopover.tsx`](../../../packages/ui/components/core/UnpublishReasonPopover.tsx)                                     | The "Set status" row action's popover, shared with the Organizations table |
| [`docs/DataPortal/Organizations/README.md`](../../DataPortal/Organizations/README.md)                                                                           | The `unpublishedReason` field and its other two setting surfaces           |

---

_Last verified against code: 2026-09-04._
