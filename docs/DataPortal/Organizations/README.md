# Organizations Tab

## Overview

The default tab on the Data Portal (`/admin`). It's the org directory's
system-of-record table — publish status, verification date, deletion flag, and each
org's locations — used by staff to find and audit organization records without
opening each one individually.

## Access

Visible to `dataPortalBasic` and above. The underlying `forOrganizationTable`
procedure is a `publicProcedure` at the tRPC layer (no server-side permission
check) — it's effectively access-controlled only by the tab being hidden client-side
from unauthenticated/unauthorized sessions. It doesn't currently accept any
write actions, so the exposure is read-only org data, not a mutation risk.

## How It Works

- **UI**: [`OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)
- **API**: `organization.forOrganizationTable` in
  [`packages/api/router/organization/index.ts`](../../../packages/api/router/organization/index.ts)
  → [`query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts)
- **Data**: `Organization` model (`packages/db/prisma/schema.prisma`), joined to
  `OrgLocation`

The handler runs a single `prisma.organization.findMany` with a nested `locations`
select and `orderBy: [{ deleted: 'desc' }, { name: 'asc' }]` — **with no `take`/
`skip`/cursor at all**. Every organization row, and every location under it, loads
on every visit to this tab. The table component then does all filtering, sorting,
and the global search box entirely client-side (`enablePagination: false`,
`enableRowVirtualization: true` render the full dataset via virtualized rows rather
than paging it). The query's input schema already supports `published`/`deleted`
filters, but the component always calls the query with `undefined` — so toggling
"hide deleted" in the UI filters _after_ the full deleted-org set has already been
fetched, not before.

This is the direct cause of the tab's slow initial load, and is being tracked
separately as a performance fix (move filtering/sorting/pagination server-side,
cap the nested `locations` select, add an index matching the actual sort order).

## How to Use It

- The table loads with deleted organizations hidden by default; toggle the
  **deleted** column filter to include them.
- Use the column header filters or the global search box to narrow by name, slug,
  publish status, or dates — all of this runs against data already loaded in your
  browser, so it doesn't reduce load time, only what's currently displayed.
- Expand a row to see that organization's locations.
- There is currently no way to see an accurate "date first published," an audit
  trail, or internal notes from this table — those exist elsewhere in the app (see
  Known Issues) but aren't surfaced here yet.

## Known Issues / Gotchas

- **No pagination** — the query fetches the entire org+location dataset on every
  load; this is the tab's main performance problem.
- **Client-side-only filter/sort/search** — the `published`/`deleted` filters the
  API already supports are never sent as query input, so server-side filtering
  gains nothing today even though the plumbing exists.
- **No index matches the `orderBy`** — `Organization` has `@@index([published,
deleted])` and others, but nothing covering `[deleted, name]`, so the sort can't
  use an index once the table grows.
- **No "publish date" column** — `Organization.published` is a plain boolean with
  no timestamp. A real "first published" date can be derived from the `AuditTrail`
  table (see the pattern in `query.forOrgPageEdits.handler.ts`, which finds the
  first `published: false → true` transition), but that derivation isn't wired
  into this table yet.
- **Notes and audit trail exist but aren't surfaced here** — `InternalNote` records
  and the full `AuditTrail`-backed activity log are already built and used on the
  per-org edit page (via `Action.tsx`, `AuditDrawer.tsx`, `InternalNotesDrawer.tsx`),
  but nothing wires them into this table's row actions. An admin has to open the
  org's edit page to see either one.
- **No workflow status for unpublished orgs** — only the `published`/`deleted`
  booleans exist; there's no field for "awaiting permission," "data entry in
  progress," etc.
- **Row selection is half-built** — `enableMultiRowSelection`/`enableRowSelection`
  are explicitly set to `false` with the intended-`true` version commented out
  directly above them, and a column-pinning slot for the checkbox is still
  reserved. No bulk-action toolbar exists on top of it yet.
- **No search across services or locations** — search only covers columns
  returned by this query (name, slug, dates, flags); it can't currently search by
  service or location/address text.

## Related Files

| Path                                                                                                                                                        | Purpose                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [`packages/ui/components/data-portal/OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)                             | Table UI, client-side filter/sort/search config                                   |
| [`packages/api/router/organization/index.ts`](../../../packages/api/router/organization/index.ts)                                                           | tRPC route registration                                                           |
| [`packages/api/router/organization/query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts) | Prisma query                                                                      |
| [`packages/api/router/organization/query.forOrganizationTable.schema.ts`](../../../packages/api/router/organization/query.forOrganizationTable.schema.ts)   | Input schema (`published`/`deleted`, currently unused by the client)              |
| [`packages/api/router/organization/query.forOrgPageEdits.handler.ts`](../../../packages/api/router/organization/query.forOrgPageEdits.handler.ts)           | Existing pattern for deriving real publish/last-updated dates from `AuditTrail`   |
| [`packages/ui/components/data-portal/Action.tsx`](../../../packages/ui/components/data-portal/Action.tsx)                                                   | Existing notes/audit-log row actions, currently only wired into the org edit page |
| `packages/db/prisma/schema.prisma` (`Organization` model, `~L304-354`)                                                                                      | Schema + indexes                                                                  |

---

_Last verified against code: 2026-08-10._
