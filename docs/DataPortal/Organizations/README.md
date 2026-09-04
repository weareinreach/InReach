# Organizations

## Overview

The default landing page of the Data Portal (`/data-portal/organizations` —
`/data-portal` redirects here; previously the default tab at `/admin`). It's the
org directory's system-of-record table — publish status (with an unpublish
reason, not just a bare boolean), verification date, deletion flag, and each
org's locations — used by staff to find and audit organization records without
opening each one individually.

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

The page renders inside
[`DataPortalPageShell`](../../../packages/ui/components/data-portal/DataPortalPageShell.tsx)
(header bar + left side nav, `activeSection='organizations'`) — the shared chrome
the redesign called for has landed and is in use here and on every other
Organizations-section page (Reviews, Reports, Downloads). One rough edge: each of
those pages defines its own local `organizationsSideNav` array rather than
importing one shared config — identical except for which item is marked `active` —
so adding, renaming, or reordering a nav item currently means editing every page
file, not one source of truth.

## How to Use It

- The table loads with deleted organizations hidden by default; use the toolbar's
  Status / Create Method filters and the Deleted toggle icon (cycling
  "unset → true → false") to filter — state persists across pagination and
  re-sorting.
- Use the **"Add an organization"** button next to the page heading (`AddOrgModal`)
  to create a new org without leaving this page — the same fields/duplicate-check
  as the public Suggest-an-Org form, with three save behaviors across the bottom
  of the modal: **Save** (`carbon:save` — just create it), **Save & Edit**
  (`carbon:edit` — create, then jump to the org's edit page), **Save & New**
  (`carbon:add` — create, then reopen a blank form for another entry; this
  loop-the-form approach is the supported "bulk add" path — no separate
  spreadsheet/import UI exists). Labeled "Save," not "Create" or "Submit" —
  "Submit" is reserved for the public Suggest-an-Org form, where it correctly
  signals "this goes to review"; reusing it here would blur that distinction,
  since staff-added orgs go through the same publish gate as public
  suggestions — nothing here self-publishes.
- **Status** and **Create Method** are toolbar-level filters, not column header
  filters — `Create Method`'s underlying column is `hiddenByDefault`, so a
  column-header filter control would never render; see
  [`docs/Database/organization_creator_had_dp_access.md`](../../Database/organization_creator_had_dp_access.md)
  for what "Public" vs. "Internal" actually means. **Status** is a `MultiSelect`
  (`All` / `Published` / each `OrgUnpublishedReason` value — currently New, In
  progress, Waiting to hear back, Inactive, Unaffirming, Unresponsive, labeled via
  `ORG_UNPUBLISHED_REASON_LABELS`) — this superseded a plain
  Published/Unpublished dropdown once orgs could carry a specific reason for
  being unpublished, not just the bare boolean. Each row also has a **Set
  status** action (the tag icon) opening `UnpublishReasonPopover` to set or
  re-triage that reason directly from the table — deliberately one-directional:
  it can unpublish-with-a-reason or change an already-unpublished org's reason,
  but never re-publish. Publishing stays on the org's own edit page, where the
  content was just reviewed, since it has a real public consequence (the org
  becomes searchable again).
- **A second surface sets the same field: the org's own edit page.** `Navbar.tsx`'s
  Edit Mode Bar has a Publish/Unpublish toggle (`handlePublishToggle`, calling the
  same `component.EditModeBarPublish` mutation as the table's popover above) that's
  asymmetric the same way: **Publish** is instant, no reason, no prompt — unchanged
  from before this system existed. **Unpublish**, for an `Organization` specifically,
  opens the same `UnpublishReasonPopover` used above instead of firing immediately,
  with the same optional note field. `OrgLocation`/`OrgService` edit pages keep a
  plain instant toggle either way — the reason field doesn't apply to them, only to
  `Organization`. Either surface's note (or an auto-generated fallback like "Status
  updated to Waiting to hear back" if left blank) is written to `InternalNote`, so
  there's always a readable breadcrumb regardless of which surface was used.
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
- **Historical backfill for pre-existing unpublished orgs is manual, not automated.**
  The reason system (see "How to Use It") only started populating going forward —
  orgs unpublished before it shipped have no reason value. Nothing in the schema
  captures _why_ they were unpublished historically, so this can't be inferred —
  see [`docs/Dashboards/UnpublishedStatus/README.md`](../../Dashboards/UnpublishedStatus/README.md)
  for the triage worklist built for staff to work through them by hand.
- **No row selection / bulk actions** — the previous client-side table had a
  half-built, disabled row-selection column; it wasn't carried over since nothing
  ever consumed it. Add it back to `DataTable` if a bulk-action toolbar is needed.
- **No search across services or locations** — search only covers the organization
  name; it can't currently search by service or location/address text.
- **Column widths/order are fixed** — `DataTable` intentionally doesn't support
  drag-to-resize or drag-to-reorder columns (see that component's own notes); the
  column show/hide menu is the supported way to tailor the view.
- **Proposed: cross-org/service content search + bulk-adjacent editing** — see
  [`content-search-bulk-edit.md`](./content-search-bulk-edit.md) for a design
  discussion (not yet implemented) that would add a new side-nav item here for
  searching org/service names, descriptions, and attributes by keyword, and
  editing matches inline. Directly addresses the "no search across services or
  locations" gap above.

## Related Files

| Path                                                                                                                                                                  | Purpose                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`apps/app/src/pages/data-portal/organizations.tsx`](../../../apps/app/src/pages/data-portal/organizations.tsx)                                                       | Page: permission gate, renders `OrganizationTable`                                                                          |
| [`packages/ui/components/data-portal/OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)                                       | Table UI, column definitions, toolbar filters                                                                               |
| [`packages/ui/components/data-portal/DataTable/`](../../../packages/ui/components/data-portal/DataTable/index.tsx)                                                    | Shared table engine used by every Data Portal table                                                                         |
| [`packages/ui/components/data-portal/DataPortalPageShell.tsx`](../../../packages/ui/components/data-portal/DataPortalPageShell.tsx)                                   | Header bar + side-nav chrome this page renders inside                                                                       |
| [`packages/ui/components/data-portal/AddOrgModal.tsx`](../../../packages/ui/components/data-portal/AddOrgModal.tsx)                                                   | "Add an organization" button + modal, rendered next to this page's heading                                                  |
| [`packages/ui/components/sections/Navbar.tsx`](../../../packages/ui/components/sections/Navbar.tsx)                                                                   | `EditModeBar` — the org edit page's Publish/Unpublish toggle, the second surface for setting a status (see "How to Use It") |
| [`packages/api/router/component/mutation.EditModeBarPublish.schema.ts`](../../../packages/api/router/component/mutation.EditModeBarPublish.schema.ts) / `.handler.ts` | Backend shared by both status-setting surfaces                                                                              |
| [`packages/ui/components/core/UnpublishReasonPopover.tsx`](../../../packages/ui/components/core/UnpublishReasonPopover.tsx)                                           | The reason-picker popover shared by both surfaces                                                                           |
| [`content-search-bulk-edit.md`](./content-search-bulk-edit.md)                                                                                                        | Proposed sibling feature: cross-org/service content search + inline bulk editing                                            |
| [`duplicate-service.md`](./duplicate-service.md)                                                                                                                      | Implemented sibling feature: clone an existing service, reached from a service's edit drawer (not this table directly)      |
| [`packages/db/enums/labels.ts`](../../../packages/db/enums/labels.ts)                                                                                                 | `ORG_UNPUBLISHED_REASON_LABELS` — human labels for each `OrgUnpublishedReason` value                                        |
| [`docs/Dashboards/UnpublishedStatus/README.md`](../../Dashboards/UnpublishedStatus/README.md)                                                                         | Manual backfill triage worklist for pre-existing unpublished orgs with no reason set                                        |
| [`packages/api/router/organization/index.ts`](../../../packages/api/router/organization/index.ts)                                                                     | tRPC route registration                                                                                                     |
| [`packages/api/router/organization/query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts)           | Prisma query, `where`/`orderBy` builders, fuzzy-search path                                                                 |
| [`packages/api/router/organization/query.forOrganizationTable.schema.ts`](../../../packages/api/router/organization/query.forOrganizationTable.schema.ts)             | Input schema (filters, sorting, `take`/`skip`)                                                                              |
| [`packages/api/router/organization/query.forOrgPageEdits.handler.ts`](../../../packages/api/router/organization/query.forOrgPageEdits.handler.ts)                     | Existing pattern for deriving real publish/last-updated dates from `AuditTrail`                                             |
| [`packages/ui/components/data-portal/Action.tsx`](../../../packages/ui/components/data-portal/Action.tsx)                                                             | Existing notes/audit-log row actions, also wired into the org edit page                                                     |
| `packages/db/prisma/schema.prisma` (`Organization` model, `~L304-354`)                                                                                                | Schema + indexes                                                                                                            |
| [`packages/api/router/organization/lib/createOrgSuggestion.ts`](../../../packages/api/router/organization/lib/createOrgSuggestion.ts)                                 | Computes `creatorHadDpAccess` at org-creation time                                                                          |
| [`docs/Database/organization_creator_had_dp_access.md`](../../Database/organization_creator_had_dp_access.md)                                                         | How `creatorHadDpAccess` / the Create Method filter works, incl. backfill                                                   |
| [`docs/Database/SQLScripts/backfill-organization-creator-had-dp-access.sql`](../../Database/SQLScripts/backfill-organization-creator-had-dp-access.sql)               | One-time historical backfill for `creatorHadDpAccess`                                                                       |

---

_Last verified against code: 2026-09-04._
