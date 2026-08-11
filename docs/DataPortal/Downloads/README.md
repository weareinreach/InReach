# Downloads Tab

## Overview

Not a data grid — a static catalog of buttons that generate on-demand CSV exports
of precomputed organization/service aggregate data: published/unpublished org
lists, org-review lists, and organization/service counts sliced by
country/state/category/attribute. Used for reporting and one-off data audits, not
day-to-day moderation.

For the exact SQL, output columns, and sample results of every individual report,
see [`summary.md`](./summary.md) — this file covers the tab
mechanics, not each report's business logic.

## Access

The tab and every individual download button require `dataPortalAdmin`+ on the
client (`DownloadTable.tsx` re-checks this itself, redundantly with the page-level
tab gate; `CsvDownload.tsx` also checks its own `permissionKey='dataPortalAdmin'`
before rendering). **The server-side procedures only require
`dataPortalManager`+** — looser than what the UI implies. See Known Issues.

## How It Works

- **UI**: [`DownloadTable.tsx`](../../../packages/ui/components/data-portal/DownloadTable.tsx)
  renders four groups of buttons (Published/Unpublished Lists, Review Lists,
  Organization Counts, Service Counts), each button a
  [`CsvDownload.tsx`](../../../packages/ui/components/data-portal/CsvDownload.tsx)
  instance.
- **API**: eleven procedures in
  [`packages/api/router/csvDownload/index.ts`](../../../packages/api/router/csvDownload/index.ts),
  all `permissionedProcedure('dataPortalManager')` and deliberately defined as
  `.mutation()` rather than `.query()` — so a report only runs when its button is
  clicked, not on tab mount.
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

- **Server permission is looser than the UI implies**: the tab/buttons require
  Admin+, but every underlying tRPC procedure only requires Manager+. In practice
  this is masked because Managers never see the tab, but calling one of these
  procedures directly (or a future UI change that surfaces it earlier) would
  succeed at Manager tier.
- `CsvDownload.tsx`'s file header comment still refers to its old path
  (`components/core/ActionButtons/CsvDownload.tsx`) — stale from a prior move, not
  a functional issue, but worth fixing if that file is touched again.

## Related Files

| Path                                                                                                                    | Purpose                                      |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`packages/ui/components/data-portal/DownloadTable.tsx`](../../../packages/ui/components/data-portal/DownloadTable.tsx) | Button grid UI                               |
| [`packages/ui/components/data-portal/CsvDownload.tsx`](../../../packages/ui/components/data-portal/CsvDownload.tsx)     | Per-report download button                   |
| `packages/ui/hooks/useCsvDownload.ts`                                                                                   | Client-side CSV conversion                   |
| `packages/api/router/csvDownload/index.ts`                                                                              | All 11 report procedures, permission level   |
| `packages/db/prisma/schema.prisma` (`view` blocks, `~L2020-2170`)                                                       | View definitions Prisma can't model directly |
| [`summary.md`](./summary.md)                                                                                            | Per-report SQL, columns, and sample output   |

---

_Last verified against code: 2026-08-10._
