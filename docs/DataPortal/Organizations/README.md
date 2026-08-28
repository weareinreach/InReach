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

- **UI**: [`OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx),
  built on the shared
  [`DataTable`](../../../packages/ui/components/data-portal/DataTable/index.tsx)
  component (a thin `@tanstack/react-table` + Mantine `Table` wrapper — see that
  directory's own doc comments for its column/filter/pagination API).
- **API**: `organization.forOrganizationTable` in
  [`packages/api/router/organization/index.ts`](../../../packages/api/router/organization/index.ts)
  → [`query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts)
- **Data**: `Organization` model (`packages/db/prisma/schema.prisma`), joined to
  `OrgLocation`

Filtering, sorting, and pagination all run server-side: the table's column filters
(published/deleted toggles, `lastVerified`/`updatedAt`/`createdAt` date ranges) and
global search box are sent as query input, and the handler builds a Prisma `where`/
`orderBy`/`take`/`skip` from them rather than loading the full table. A non-empty
search term instead runs a raw-SQL trigram-similarity + synonym-expansion lookup
(the same approach as the public org search — see `searchIds` in the handler) so
fuzzy/partial name matches still rank sensibly, then re-hydrates the full row shape
via a normal `findMany` against the matched IDs.

This replaced two previous versions of this tab (`OrganizationTable` / "V1", fully
client-side and unpaginated, and `OrganizationTableV2`, the server-side rewrite kept
alongside it for direct comparison) — V1 was retired and V2 was promoted to be the
only `OrganizationTable` once the Mantine v7 migration required rebuilding this
component's underlying table library regardless, removing the reason to keep both
around.

## How to Use It

- The table loads with deleted organizations hidden by default; use the toolbar's
  deleted/published toggle icons (cycling "unset → true → false") or the state
  persists across pagination and re-sorting.
- Use the column header filter icons or the global search box to narrow by name,
  publish status, or dates — all of this is a real server-side query, so it also
  reduces what's fetched, not just what's displayed.
- Expand a row to see that organization's locations.
- There is currently no way to see an accurate "date first published," an audit
  trail, or internal notes from the location sub-rows — those exist for the parent
  organization row only (via the activity-log/internal-notes row actions).

## Known Issues / Gotchas

- **No index matches the `orderBy`** — `Organization`'s actual indexes are
  `[name]`, `[attributeIds] Gin`, `[serviceIds] Gin`, `[published, deleted]`,
  `[slug]`, `[slug, published, deleted]`, and `[id, published desc, deleted]` —
  none cover `[deleted, name]`, so the default sort can't use an index once the
  table grows. Worth adding if query latency becomes noticeable in practice.
- **No "publish date" column** — `Organization.published` is a plain boolean with
  no timestamp. A real "first published" date can be derived from the `AuditTrail`
  table (see the pattern in `query.forOrgPageEdits.handler.ts`, which finds the
  first `published: false → true` transition), but that derivation isn't wired
  into this table yet.
- **No workflow status for unpublished orgs** — only the `published`/`deleted`
  booleans exist; there's no field for "awaiting permission," "data entry in
  progress," etc.
- **No row selection / bulk actions** — the previous client-side table had a
  half-built, disabled row-selection column; it wasn't carried over since nothing
  ever consumed it. Add it back to `DataTable` if a bulk-action toolbar is needed.
- **No search across services or locations** — search only covers the organization
  name; it can't currently search by service or location/address text.
- **Column widths/order are fixed** — `DataTable` intentionally doesn't support
  drag-to-resize or drag-to-reorder columns (see that component's own notes); the
  column show/hide menu is the supported way to tailor the view.

## Related Files

| Path                                                                                                                                                        | Purpose                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`packages/ui/components/data-portal/OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)                             | Table UI, column definitions, toolbar toggles                                   |
| [`packages/ui/components/data-portal/DataTable/`](../../../packages/ui/components/data-portal/DataTable/index.tsx)                                          | Shared table engine used by every Data Portal table                             |
| [`packages/api/router/organization/index.ts`](../../../packages/api/router/organization/index.ts)                                                           | tRPC route registration                                                         |
| [`packages/api/router/organization/query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts) | Prisma query, `where`/`orderBy` builders, fuzzy-search path                     |
| [`packages/api/router/organization/query.forOrganizationTable.schema.ts`](../../../packages/api/router/organization/query.forOrganizationTable.schema.ts)   | Input schema (filters, sorting, `take`/`skip`)                                  |
| [`packages/api/router/organization/query.forOrgPageEdits.handler.ts`](../../../packages/api/router/organization/query.forOrgPageEdits.handler.ts)           | Existing pattern for deriving real publish/last-updated dates from `AuditTrail` |
| [`packages/ui/components/data-portal/Action.tsx`](../../../packages/ui/components/data-portal/Action.tsx)                                                   | Existing notes/audit-log row actions, also wired into the org edit page         |
| `packages/db/prisma/schema.prisma` (`Organization` model, `~L304-354`)                                                                                      | Schema + indexes                                                                |

---

_Last verified against code: 2026-08-19._
