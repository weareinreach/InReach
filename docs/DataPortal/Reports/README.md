# Reports Tab

## Overview

Moderation queue for user-submitted content flags — reports that a listing is
closed, incorrect, or otherwise needs attention, filed against an organization or
a specific service. Staff triage each report through a status workflow and leave
internal notes as they resolve it.

## Access

The tab is shown to `dataPortalBasic` and above in
`apps/app/src/pages/admin/index.tsx`, but **both the list query and the update
mutation actually require `dataPortalManager`+** (`permissionedProcedure
('dataPortalManager')` in `packages/api/router/report/index.ts`). A Basic-tier
user sees the tab and an empty/error state, not usable data — this is a
tab-visibility/server-permission mismatch, not intentional partial access. See
Known Issues.

## How It Works

- **UI**: [`ReportTable.tsx`](../../../packages/ui/components/data-portal/ReportTable.tsx)
- **API**:
  - `report.forReportsTable` → `query.forReportsTable.handler.ts` — fetches
    `Report` rows joined to `organization`, `reportedBy`/`handledBy` (`User`), and
    `internalNotes`.
  - `report.update` → `mutation.update.handler.ts` — updates `status`/`informed`,
    sets `handledBy` to the acting user, and inside the same transaction writes a
    new `InternalNote` whenever a note is supplied or the status changes.
  - `report.create` is a separate `publicProcedure` used by the public-facing
    "report this" form — not called from this admin table.
- **Data**: `Report` model, `ReportStatus` enum (`PENDING` / `ACKNOWLEDGED` /
  `RESOLVED`), `ReportIssueType` enum, `InternalNote`.

## How to Use It

- The **status** column is color/weight-coded by how long a report has sat since
  its last update — older pending reports are visually flagged so they don't get
  missed.
- Click **View Details** to open a report: set its **Status**
  (Pending/Acknowledged/Resolved), toggle **User Informed**, and add an internal
  note. **Resolving a report requires a non-empty note** — you can't mark
  something Resolved with no explanation.
- **Edit Target** opens the reported organization's edit page in a new tab.
- A report can be deep-linked directly via `?reportId=<id>` in the URL, which
  auto-opens its details modal on load.
- Every status change or note is retained as internal history, visible in the same
  modal.

## Known Issues / Gotchas

- **Tab-visibility vs. server-permission mismatch**: the tab shows for Basic+, but
  the query/mutation require Manager+. A Basic-tier account should either be
  excluded from the tab entirely, or the server-side permission should be relaxed
  to match — as-is, Basic users hit an authorization error.

## Related Files

| Path                                                                                                                    | Purpose                                   |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [`packages/ui/components/data-portal/ReportTable.tsx`](../../../packages/ui/components/data-portal/ReportTable.tsx)     | Table UI + details modal                  |
| `packages/api/router/report/query.forReportsTable.handler.ts`                                                           | List query                                |
| `packages/api/router/report/mutation.update.handler.ts`                                                                 | Status/note update mutation               |
| `packages/api/router/report/index.ts`                                                                                   | tRPC route registration, permission level |
| `packages/db/prisma/schema.prisma` (`Report` model, `~L961-992`; `ReportStatus`/`ReportIssueType` enums, `~L2205-2216`) | Schema                                    |

---

_Last verified against code: 2026-08-10._
