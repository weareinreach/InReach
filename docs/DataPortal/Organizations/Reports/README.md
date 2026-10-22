# Reports

## Overview

Moderation queue for user-submitted content flags — reports that a listing is
closed, incorrect, or otherwise needs attention, filed against an organization or
a specific service. Staff triage each report through a status workflow and leave
internal notes as they resolve it. Lives at `/data-portal/reports` (previously the
"Reports" tab at `/admin`).

## Access

Basic and above can open the page and view the table: `report.forReportsTable`
uses the `viewAllReports` permission (`dataPortalBasic`, in
`packages/api/lib/permissions.ts`). Changing a report - its status, the "User
Informed" flag, internal notes - stays at `dataPortalManager`+ (`report.update`).
Below Manager, the details modal opens read-only: status and "User Informed" show
as text, and the note field and Save button are replaced by a line saying only
Managers and above can update a report. This is the same view-vs-act split as
Reviews, and closes #2106 (previously the page was reachable at Basic but both
procedures required Manager, so Basic users got an authorization error).

## How It Works

- **UI**: [`ReportTable.tsx`](../../../../packages/ui/components/data-portal/ReportTable.tsx),
  built on the shared
  [`DataTable`](../../../../packages/ui/components/data-portal/DataTable/index.tsx)
  component, rendered from
  [`apps/app/src/pages/data-portal/reports.tsx`](../../../../apps/app/src/pages/data-portal/reports.tsx).
- **API**:
  - `report.forReportsTable` → `query.forReportsTable.handler.ts` — filters,
    sorts, and paginates `Report` rows server-side (status/issue-type/informed
    filters, a text search across org/service/user fields, `take`/`skip`), joined
    to `organization`, `reportedBy`/`handledBy` (`User`), and `internalNotes`.
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
- The Actions column has two distinct icons for two distinct targets: a
  **task-edit** icon (`carbon:task-edit`) opens _this report's_ own triage modal
  — set its **Status** (Pending/Acknowledged/Resolved), toggle **User
  Informed**, and add an internal note. **Resolving a report requires a
  non-empty note** — you can't mark something Resolved with no explanation.
  A separate pencil icon ("Edit Target," `carbon:edit`) opens the _reported
  organization's_ own edit page in a new tab — a different record entirely.
  (Previously both used the same icon vocabulary as "view a live record"
  elsewhere in the Data Portal — `carbon:search` for the report action,
  `carbon:edit` for the org jump — which read backwards, since the report
  action is this row's primary mutation surface, not a passive view. The pencil
  stays reserved for "edit an org/service" everywhere else in the Data Portal;
  `task-edit` was chosen specifically to avoid colliding with that meaning.)
- A report can be deep-linked directly via `?reportId=<id>` in the URL (e.g.
  `/data-portal/reports?reportId=<id>`), which auto-opens its details modal on
  load — via an independent lookup, not by searching whatever page of the table
  happens to be loaded. `ReportTable.tsx` reads `router.query.reportId` directly,
  so this works regardless of which route the table is rendered under.
- Every status change or note is retained as internal history, visible in the same
  modal.

## Known Issues / Gotchas

- **No shared page chrome yet** — this page currently renders standalone, not yet
  inside the new redesign's header bar/side-nav/page-heading shell (in the target
  design this page becomes a side-nav item under Organizations) — that's a later
  phase.

## Related Files

| Path                                                                                                                    | Purpose                                      |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`apps/app/src/pages/data-portal/reports.tsx`](../../../../apps/app/src/pages/data-portal/reports.tsx)                  | Page: permission gate, renders `ReportTable` |
| [`packages/ui/components/data-portal/ReportTable.tsx`](../../../../packages/ui/components/data-portal/ReportTable.tsx)  | Table UI + details modal                     |
| `packages/api/router/report/query.forReportsTable.handler.ts`                                                           | List query                                   |
| `packages/api/router/report/mutation.update.handler.ts`                                                                 | Status/note update mutation                  |
| `packages/api/router/report/index.ts`                                                                                   | tRPC route registration, permission level    |
| `packages/db/prisma/schema.prisma` (`Report` model, `~L961-992`; `ReportStatus`/`ReportIssueType` enums, `~L2205-2216`) | Schema                                       |

---

_Last verified against code: 2026-10-19._
