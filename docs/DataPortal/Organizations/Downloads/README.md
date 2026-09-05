# Downloads

## Overview

Not a data grid — a static catalog of buttons that generate on-demand CSV exports
of precomputed organization/service aggregate data: published/unpublished org
lists, org-review lists, and organization/service counts sliced by
country/state/category/attribute. Used for reporting and one-off data audits, not
day-to-day moderation. Lives at `/data-portal/downloads` (previously the
"Downloads" tab at `/admin`).

For the exact SQL, output columns, and sample results of every individual report,
see [`summary.md`](./summary.md) — this file covers the page
mechanics, not each report's business logic.

## Access

Gated at `dataPortalManager` and above, consistently, at every layer:

- The page's own `getServerSideProps`
  (`apps/app/src/pages/data-portal/downloads.tsx`) requires `dataPortalManager`+.
- `DownloadTable.tsx`'s top-level `canViewDownloads` check requires
  `dataPortalManager`+ (or `dataPortalAdmin`/root).
- Every individual row's `permissionKey` is `dataPortalManager` (read by
  `CsvDownload.tsx`'s hierarchy-aware check, which treats Manager as satisfied by
  Manager, Admin, or root).

This was previously a three-way mismatch — the old `/admin` tab gate required
Admin+, `DownloadTable`'s `canViewDownloads` also required Admin+, and every row's
`permissionKey` was `dataPortalAdmin`, while the underlying tRPC procedures had
only ever required `dataPortalManager`+. All three layers were corrected to
Manager+ as part of the `/admin` → `/data-portal` relocation, since it's a
frontend-only threshold change (no backend/schema change involved) — see
[`docs/DataPortal/2026-Redesign/UI_elements.md`](../../2026-Redesign/UI_elements.md).

## How It Works

- **UI**: [`DownloadTable.tsx`](../../../../packages/ui/components/data-portal/DownloadTable.tsx)
  renders four groups of buttons (Published/Unpublished Lists, Review Lists,
  Organization Counts, Service Counts), each button a
  [`CsvDownload.tsx`](../../../../packages/ui/components/data-portal/CsvDownload.tsx)
  instance, rendered from
  [`apps/app/src/pages/data-portal/downloads.tsx`](../../../../apps/app/src/pages/data-portal/downloads.tsx).
- **API**: eleven procedures in
  [`packages/api/router/csvDownload/index.ts`](../../../../packages/api/router/csvDownload/index.ts),
  all `permissionedProcedure('dataPortalManager')` and deliberately defined as
  `.mutation()` rather than `.query()` — so a report only runs when its button is
  clicked, not on page mount.
- **Data**: none of these query a normal Prisma model — they run `prisma.$queryRaw`
  against named Postgres views (`organizations_csv_export_view`,
  `organizations_with_review`, `OrganizationsCountryCounts`,
  `ServicesCountByCategoryCalifornia`, etc.), defined in `schema.prisma` as
  `view` blocks annotated `@@ignore` (Prisma can't generate a client model for a
  view with no unique identifier, hence the raw SQL). The views themselves come
  from SQL migrations under `packages/db/prisma/migrations/`.

Generation is two steps: the mutation returns rows, then the browser converts them
to CSV client-side (`useCsvDownload` → `convertToCsv`) — there's no server-side
file storage, and nothing is generated until you click.

## How to Use It

- Click a button to generate and download that report immediately as a CSV.
- Reports reflect whenever their underlying Postgres view was last refreshed, not
  necessarily the current instant — if a number looks stale, check when the view
  was last rebuilt before assuming the report logic is wrong.
- "Organization Counts" reports count unique **organizations**, not their
  locations or services (an org with 50 locations still counts as 1).

## Known Issues / Gotchas

- `CsvDownload.tsx`'s file header comment still refers to its old path
  (`components/core/ActionButtons/CsvDownload.tsx`) — stale from a prior move, not
  a functional issue, but worth fixing if that file is touched again.
- **No shared page chrome yet** — this page currently renders standalone, not yet
  inside the new redesign's header bar/side-nav/page-heading shell (in the target
  design this page becomes a side-nav item under Organizations) — that's a later
  phase, and this page's own long-term future is to be retired in favor of an
  export action on the Organizations table and/or a future Director's Dashboard
  view (see `docs/DataPortal/2026-Redesign/UI_elements.md`).

## Related Files

| Path                                                                                                                       | Purpose                                                          |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`apps/app/src/pages/data-portal/downloads.tsx`](../../../../apps/app/src/pages/data-portal/downloads.tsx)                 | Page: permission gate, renders `DownloadTable`                   |
| [`packages/ui/components/data-portal/DownloadTable.tsx`](../../../../packages/ui/components/data-portal/DownloadTable.tsx) | Button grid UI, `canViewDownloads` gate, per-row `permissionKey` |
| [`packages/ui/components/data-portal/CsvDownload.tsx`](../../../../packages/ui/components/data-portal/CsvDownload.tsx)     | Per-report download button, hierarchy-aware permission check     |
| `packages/ui/hooks/useCsvDownload.ts`                                                                                      | Client-side CSV conversion                                       |
| `packages/api/router/csvDownload/index.ts`                                                                                 | All 11 report procedures, permission level                       |
| `packages/db/prisma/schema.prisma` (`view` blocks, `~L2020-2170`)                                                          | View definitions Prisma can't model directly                     |
| [`summary.md`](./summary.md)                                                                                               | Per-report SQL, columns, and sample output                       |

---

_Last verified against code: 2026-09-04._
