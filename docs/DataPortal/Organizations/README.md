# Organizations

## Overview

The default landing page of the Data Portal (`/data-portal/organizations` —
`/data-portal` redirects here; previously the default tab at `/admin`). It's the
org directory's system-of-record table — publish status, verification date,
deletion flag, and each org's locations — used by staff to find and audit
organization records without opening each one individually.

## Access

Gated at `dataPortalBasic` and above in this page's own `getServerSideProps`
(`apps/app/src/pages/data-portal/organizations.tsx` — previously this check lived
in the shared `apps/app/src/pages/admin/index.tsx`). The underlying
`forOrganizationTable` procedure is a `publicProcedure` at the tRPC layer (no
server-side permission check) — it's effectively access-controlled only by the
page itself redirecting unauthenticated/unauthorized sessions. It doesn't
currently accept any write actions, so the exposure is read-only org data, not a
mutation risk.

## How It Works

- **UI**: [`OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx),
  built on the shared
  [`DataTable`](../../../packages/ui/components/data-portal/DataTable/index.tsx)
  component (a thin `@tanstack/react-table` + Mantine `Table` wrapper — see that
  directory's own doc comments for its column/filter/pagination API), rendered
  from [`apps/app/src/pages/data-portal/organizations.tsx`](../../../apps/app/src/pages/data-portal/organizations.tsx).
- **API**: `organization.forOrganizationTable` in
  [`packages/api/router/organization/index.ts`](../../../packages/api/router/organization/index.ts)
  → [`query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts)
- **Data**: `Organization` model (`packages/db/prisma/schema.prisma`), joined to
  `OrgLocation`

Filtering, sorting, and pagination all run server-side: the table's filters
(published/deleted/create-method, `lastVerified`/`updatedAt`/`createdAt` date
ranges) and global search box are sent as query input, and the handler builds a
Prisma `where`/`orderBy`/`take`/`skip` from them rather than loading the full
table. A non-empty search term instead runs a raw-SQL trigram-similarity +
synonym-expansion lookup (the same approach as the public org search — see
`searchIds` in the handler) so fuzzy/partial name matches still rank sensibly,
then re-hydrates the full row shape via a normal `findMany` against the matched
IDs. The create-method filter is implemented on both paths so it stays
consistent whether or not a search term is active.

This replaced two previous versions of this tab (`OrganizationTable` / "V1", fully
client-side and unpaginated, and `OrganizationTableV2`, the server-side rewrite kept
alongside it for direct comparison) — V1 was retired and V2 was promoted to be the
only `OrganizationTable` once the Mantine v7 migration required rebuilding this
component's underlying table library regardless, removing the reason to keep both
around.

## How to Use It

- The table loads with deleted organizations hidden by default; use the toolbar's
  Publish Status / Create Method dropdowns and the Deleted toggle icon (cycling
  "unset → true → false") to filter — state persists across pagination and
  re-sorting.
- **Publish Status** and **Create Method** are toolbar-level `Select` dropdowns,
  not column header filters — `Create Method`'s underlying column is
  `hiddenByDefault`, so a column-header filter control would never render; see
  [`docs/Database/organization_creator_had_dp_access.md`](../../Database/organization_creator_had_dp_access.md)
  for what "Public" vs. "Internal" actually means.
- Use the column header filter icons or the global search box to narrow by name
  or dates — all of this is a real server-side query, so it also reduces what's
  fetched, not just what's displayed.
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
- **No shared page chrome yet** — this page currently renders standalone (a
  generic "Welcome, {name}" heading), not yet inside the new redesign's header
  bar/side-nav/page-heading shell — that's a later phase. See
  [`docs/DataPortal/2026-Redesign/UI_elements.md`](../2026-Redesign/UI_elements.md).

## Related Files

| Path                                                                                                                                                        | Purpose                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`apps/app/src/pages/data-portal/organizations.tsx`](../../../apps/app/src/pages/data-portal/organizations.tsx)                                             | Page: permission gate, renders `OrganizationTable`                              |
| [`packages/ui/components/data-portal/OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)                             | Table UI, column definitions, toolbar filters                                   |
| [`packages/ui/components/data-portal/DataTable/`](../../../packages/ui/components/data-portal/DataTable/index.tsx)                                          | Shared table engine used by every Data Portal table                             |
| [`packages/api/router/organization/index.ts`](../../../packages/api/router/organization/index.ts)                                                           | tRPC route registration                                                         |
| [`packages/api/router/organization/query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts) | Prisma query, `where`/`orderBy` builders, fuzzy-search path                     |
| [`packages/api/router/organization/query.forOrganizationTable.schema.ts`](../../../packages/api/router/organization/query.forOrganizationTable.schema.ts)   | Input schema (filters, sorting, `take`/`skip`)                                  |
| [`packages/api/router/organization/query.forOrgPageEdits.handler.ts`](../../../packages/api/router/organization/query.forOrgPageEdits.handler.ts)           | Existing pattern for deriving real publish/last-updated dates from `AuditTrail` |
| [`packages/ui/components/data-portal/Action.tsx`](../../../packages/ui/components/data-portal/Action.tsx)                                                   | Existing notes/audit-log row actions, also wired into the org edit page         |
| `packages/db/prisma/schema.prisma` (`Organization` model, `~L304-354`)                                                                                      | Schema + indexes                                                                |
| [`packages/api/router/organization/lib/createOrgSuggestion.ts`](../../../packages/api/router/organization/lib/createOrgSuggestion.ts)                       | Computes `creatorHadDpAccess` at org-creation time                              |
| [`docs/Database/organization_creator_had_dp_access.md`](../../Database/organization_creator_had_dp_access.md)                                               | How `creatorHadDpAccess` / the Create Method filter works, incl. backfill       |
| [`docs/Database/SQLScripts/backfill-organization-creator-had-dp-access.sql`](../../Database/SQLScripts/backfill-organization-creator-had-dp-access.sql)     | One-time historical backfill for `creatorHadDpAccess`                           |

---

_Last verified against code: 2026-08-31._
