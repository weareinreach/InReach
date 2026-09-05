# Bulk Search & Replace

> **Status: Implemented (v1), branch `bulk-edit`.** The schema/migration, all five tRPC procedures,
> the `DataTable` additions, the page, and the results table described below are real, shipped code —
> every path in this doc is now a real file, not a proposal, unless explicitly marked otherwise.
> Verified against actual code and a live local database, not assumed, on 2026-09-05. The bulk
> attribute/tag dialog's per-service preview and its post-Apply result notification were both missing
> from the first pass — found while writing this doc, fixed the same day, and covered by a new
> automated test (see [Known Issues / Gotchas](#known-issues--gotchas)). The results table was then
> reworked a second time to actually adopt the standard `DataTable` toolbar/column conventions every
> other Data Portal table uses (`OrganizationTable` is the reference implementation) — a deleted
> toggle, an `Actions` column with both a quick-edit popover and a link to the record's real edit page,
> and new Service Tags/Attributes/Status/Updated/Created columns, with only **Actions, Name, Matches,
> Service Tags, Attributes** visible by default (the rest are one click away in the column-visibility
> menu). The service "full edit" link also gained the ability to deep-link straight into a specific
> service's edit drawer (new `autoOpen` prop on `ServiceEditDrawer`) — see
> [How It Works](#how-it-works). A **third** round replaced the toolbar's organization-level Status
> filter with Service Tags/Attributes filters instead (a deliberate reversal — Status didn't turn out
> to be the useful toolbar filter here; narrowing by which service tags/attributes are present did),
> and widened the Name and Matches columns, which had been clipping down to a couple of letters at
> tanstack's 150px default. `packages/api` had zero test infrastructure before this feature; it now has
> a minimal one, scoped specifically to the
> permission-gating defect class this doc's [Access](#access) section describes (6 passing tests,
> [`permissions.test.ts`](#test-cases)) — everything else backend-side (trigram match quality, Crowdin
> rollback, the changed-since-search race) is still manual QA. `packages/ui` has 12 passing
> component tests. Originally scoped as an unstarted backlog item in
> [`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md#bulk-search--replace).

## Overview

Lets Data Portal staff (`dataPortalManager`+) search across organization names/descriptions and
service names/descriptions/attributes/tags — six independently-checkable fields — then act on what
they find without opening each record individually, via three workflows: edit one record's Name and
Description by hand, find-and-replace one literal text pattern across several matches with a
mandatory per-row review before anything is written, or bulk-add/remove a service attribute or
service tag across a selected set of services. Solves two problems staff previously had no tooling
for: finding content that's gone stale (e.g. COVID-era language) and finding content that needs
sensitive-language review (e.g. how a service's description talks about who it serves) — both
previously required already knowing which org/service to look at, since there was no way to search by
anything other than org name (see [Organizations](./README.md)'s "No search across services or
locations" gap). Ships as its own page under the Organizations section's side nav rather than a mode
of the existing Organization table (see [How It Works](#how-it-works)), since cross-org discovery is a
distinct workflow from the existing per-org directory lookup.

## Access

Gated at `dataPortalManager` and above (`dataPortalManager`, `dataPortalAdmin`, `root`) —
stricter than the Organizations table itself (`dataPortalBasic`+, see
[Organizations/README.md](./README.md#access)). This is a deliberate floor, not an arbitrary default:
the content this feature surfaces and edits is population-sensitive (target-population language) and
reputationally/legally sensitive (stale public-health guidance), so it's scoped one tier above
ordinary org/service editing. Enforced in two places, and confirmed to actually match:

- **Page-level**: `apps/app/src/pages/data-portal/bulk-search-replace.tsx`'s `getServerSideProps` calls
  `checkServerPermissions({ permissions: ['dataPortalManager', 'dataPortalAdmin', 'root'], has: 'some' })`.
- **Server-level**: every one of this feature's five new procedures —
  `bulkSearchReplace.search`, `bulkSearchReplace.replaceText`, `service.bulkAttachTags`,
  `service.bulkDetachTags`, `service.bulkAttachAttribute`, `service.bulkDetachAttribute` — is declared
  with its own `permissionedProcedure('dataPortalManager')` call
  (`packages/api/router/bulkSearchReplace/index.ts`, `packages/api/router/service/index.ts`), never
  reusing a sibling procedure's permission wrapper.

That last rule mattered concretely: `permissionedProcedure(key)`'s gate only blocks a
`dataPortalBasic` session if `key` maps to a manager-or-above permission in
`packages/api/lib/permissions.ts`. `attachServiceTags`/`attachServiceAttribute` — the existing
single-record procedures whose write logic this feature's bulk mutations reuse — are gated at
`['editAnyOrg', 'createOrg']` (`permissions.ts:45-46`), not manager-tier. Naively wrapping the bulk
version in that same procedure, or reusing its permission key, would have let a `dataPortalBasic`
session bulk-edit tags/attributes through this feature despite the page itself being manager-gated.
Each bulk mutation instead gets its own, separately-declared `dataPortalManager` gate.
[`packages/api/lib/middleware/permissions.test.ts`](#test-cases) asserts this directly — including a
dedicated case demonstrating why `attachServiceTags`' own permission key could **not** have been
reused (it does not block a `dataPortalBasic` session).

## How It Works

- **Schema/migration**: `packages/db/prisma/schema.prisma`'s `OrgService` model
  (`schema.prisma:628-670`) gained two materialized, Gin-indexed columns —
  `attributeIds String[] @default([])` and `tagIds String[] @default([])` — the `OrgService`-level
  equivalent of `Organization.attributeIds`/`.serviceIds`, which already existed. Migration
  `packages/db/prisma/migrations/20260905090000_add_content_search_infra/migration.sql`: adds the two
  columns and their Gin indexes, backfills existing rows, adds a new
  `TranslationKey_text_trgm_gin_idx` trigram-on-expression index (same
  `lower(immutable_unaccent(regexp_replace(text, '[^a-zA-Z0-9 ]', '', 'g'))) gin_trgm_ops` pattern
  already used for `Organization.name`), and extends the two existing triggers
  (`sync_org_attribute_ids`, `sync_org_service_ids`, both created by
  `20260611000000_consolidated_v2_search`) to also maintain the new `OrgService`-level columns — both
  triggers already had the service id in hand, so this is a `CREATE OR REPLACE FUNCTION`, not a new
  trigger. Applied via `prisma migrate deploy` (`pnpm --filter @weareinreach/db db:deploy`), not
  `migrate dev` — see the migration note under [Known Issues](#known-issues--gotchas).
- **API (search)**: `packages/api/router/bulkSearchReplace/query.search.handler.ts`, registered as
  `bulkSearchReplace.search`. Two raw-SQL queries (Prisma's query builder can't express the service-level
  `EXISTS` subquery or the joined `FreeText`/`TranslationKey` `ILIKE` matching): `searchOrgIds` finds
  the paginated set of matching organization ids (matched directly by name/description, or via an
  `EXISTS` against any of that org's services matching on name/description/attributes/tags), then
  `searchServiceMatches` finds which specific services under those orgs matched and why — only those
  render as sub-rows, not every service under a matched org. Each of the six scope checkboxes
  (`orgName`, `orgDescription`, `serviceName`, `serviceDescription`, `serviceAttributes`,
  `serviceTags`) gates its own `OR`'d clause, so an unchecked field is a real filter, evaluated as
  `false AND ...` in SQL, not just hidden client-side. The two attribute/tag clauses are `EXISTS`
  checks against `os."attributeIds"`/`os."tagIds"` joined to `Attribute`/`ServiceTag` by name — an
  indexed array-membership check, not a live join against `AttributeSupplement`/`OrgServiceTag`
  directly. Also accepts a `deleted` param — **organization-level only**, `undefined` means both
  deleted/non-deleted show, matching `organization.forOrganizationTable`'s exact tri-state convention.
  Service-level `deleted` exclusion is untouched by it — the nested `EXISTS` subquery and
  `searchServiceMatches` both keep their original hardcoded `os.deleted = false`, always excluding
  deleted services regardless of the toolbar's org-level deleted toggle. Also accepts
  `serviceTagIds`/`serviceAttributeIds` (both optional arrays) — narrows to services carrying **any**
  of the selected ids, via the same indexed array-overlap (`&&`) check the scope-checkbox
  attribute/tag clauses already use, independent of which scope checkboxes are checked (a service can
  be filtered by tag even when the search term itself matched via name or description, not the tag).
  **When either is set, an org's own name/description match no longer qualifies it on its own** — the
  filter is fundamentally about services, so the org-direct-match branch of the `WHERE` clause is
  gated off (`orgDirectMatchGate`) and only a qualifying service (one that also satisfies the search
  scope, _and_ carries a selected tag/attribute) can bring the org into the results. This was a
  deliberate design call, not an oversight: a weaker version that left direct org matches unaffected
  would make the filter feel broken (selecting "Food Pantry" and still seeing orgs with no food-pantry
  service, just because the org's own name happened to match the search term).
- **API (find & replace)**: `packages/api/router/bulkSearchReplace/mutation.replaceText.handler.ts`,
  registered as `bulkSearchReplace.replaceText`. Input is an array of up to 200
  `{ recordType, field, id, searchTerm, replaceTerm }` items, one call handling the whole checked
  selection — looped server-side, not N round-trips. Per item: re-reads the record's **current** text
  fresh (not the client's stale copy from when the search ran), does a case-insensitive
  `indexOf`/substring replace of only the first occurrence, and writes through the same
  `generateNestedFreeTextUpsert` + `syncDatabaseStringIfChanged` pair every other edit in this
  codebase uses, wrapped in `getAuditedClient`. If the search term is no longer present in the current
  text, that item is reported `skipped-not-found`, not silently skipped or errored — this is the
  deliberate re-read-at-write-time design that makes Replace All safe against a stale, wide
  review window: a search-then-review-then-confirm span can cover an arbitrary delay across many
  rows, so a client-computed "new full text" built from the original search snapshot would risk
  silently clobbering someone else's edit in between. Each item's failure is caught and logged
  independently (`createLoggerInstance`, not `handleError` — `handleError` always throws, which would
  abort the whole batch on the first failure) and reported as `failed`, never blocking or rolling back
  the rest of the batch. Returns `{ results, replaced, skipped, failed }` counts.
  **`Organization.name` is deliberately excluded** from what this mutation can rewrite (only
  `field: 'description'` is valid for `recordType: 'organization'`) — changing it also triggers
  `updateBasic`'s slug-regeneration and redirect-creation side effect, which a bulk text operation
  shouldn't silently trigger across N rows. Org Name stays a valid _search_ scope; fixing one goes
  through the manual Edit button instead, which reuses `organization.updateBasic` and so already has
  that side effect intentionally.
- **API (bulk attribute/tag mutations)**: four new procedures under
  `packages/api/router/service/`, each with its own `dataPortalManager` gate (see
  [Access](#access)):
  - `bulkAttachTags`/`bulkDetachTags` — `orgServiceTag.createMany({ skipDuplicates: true })` /
    `.deleteMany`. The composite `(serviceId, tagId)` primary key on `OrgServiceTag` means
    `skipDuplicates` is a real guarantee here (unlike the attribute case below), not just an
    optimization.
  - `bulkAttachAttribute` — **v1-scoped to attributes where `requireText`, `requireBoolean`,
    `requireData`, `requireLanguage`, and `requireGeo` are all `false`** (throws a `BAD_REQUEST`
    otherwise) — a bulk action picks one taxonomy value with no per-service custom input, so anything
    needing a per-instance value can't be uniformly applied; those go through the existing
    single-record `attachServiceAttribute` instead. Confirmed against live data: **96 of 116 active
    attributes (83%) are v1-eligible.** `AttributeSupplement` has no unique constraint, so dedup
    ("already has it" vs. "will add") is computed explicitly (a `findMany` + `Set` filter) before
    writing, rather than relying on a DB-level skip.
  - `bulkDetachAttribute` — plain `attributeSupplement.deleteMany`.
  - All four return per-action counts (`added`/`alreadyHad` or `removed`) — `BulkEditDialog` surfaces
    these via a post-Apply `showNotification` call (added after the first pass shipped with no
    confirmation at all — see [Known Issues](#known-issues--gotchas)).
- **UI (nav)**: a new "Bulk Search & Replace" item added to the Organizations section's
  `organizationsSideNav` array — duplicated verbatim across
  [`organizations.tsx`](../../../apps/app/src/pages/data-portal/organizations.tsx),
  [`reviews.tsx`](../../../apps/app/src/pages/data-portal/reviews.tsx),
  [`reports.tsx`](../../../apps/app/src/pages/data-portal/reports.tsx), and
  [`downloads.tsx`](../../../apps/app/src/pages/data-portal/downloads.tsx), same as this feature's own
  [`bulk-search-replace.tsx`](../../../apps/app/src/pages/data-portal/bulk-search-replace.tsx) — no shared
  source of truth exists for this array, so adding the entry meant editing all five files, not one
  shared config. See [Known Issues](#known-issues--gotchas).
- **UI (page)**: `apps/app/src/pages/data-portal/bulk-search-replace.tsx`, rendered inside the existing
  [`DataPortalPageShell`](../../../packages/ui/components/data-portal/DataPortalPageShell.tsx)
  (`activeSection='organizations'`) — the same shell every other Organizations-section page uses.
- **UI (table)**: `packages/ui/components/data-portal/BulkSearchReplaceTable.tsx`, built on the existing
  [`DataTable`](../../../packages/ui/components/data-portal/DataTable/index.tsx) primitive, which
  gained three new optional-controlled capabilities for this feature (every existing consumer —
  `OrganizationTable` included — leaves them unset and renders exactly as before): a leading
  checkbox column (`rowSelection`/`onRowSelectionChange`/`enableRowSelection`, with
  `enableSubRowSelection` always `false` internally — a parent org row's checkbox never cascades to
  its service sub-rows), controlled expansion (`expanded`/`onExpandedChange`, promoted from a
  fully-internal `useState` so the page can seed which rows start expanded once async search results
  resolve), and a `+1` to the empty-state `colSpan` when the selection column is present.
- **UI (toolbar)**: the table now turns on `DataTable`'s toolbar (previously `showToolbar={false}`),
  mirroring `OrganizationTable`'s exact `toolbarExtra` pattern rather than inventing a new one. Two
  `MultiSelect`s — **Service Tags** and **Attributes** — share the same generic pill-rendering
  (`renderFilterPill`) and compact-input styling (`COMPACT_MULTISELECT_STYLES`) `OrganizationTable`'s
  Status filter established, options built from the exact same id→label `Map`s the Service
  Tags/Attributes _columns_ already resolve (no extra query). **An organization-level Status filter
  was tried first and then deliberately removed** — narrowing by service tags/attributes turned out to
  be the more useful toolbar filter for this table; see the status banner and
  [Known Issues](#known-issues--gotchas). The shared `TableToolbarToggle` component still handles the
  deleted 3-state cycle (`[false, true, undefined]`, defaulting to `false` — hide deleted, matching
  this feature's original, pre-toolbar behavior exactly). All three write into a `columnFilters` state
  threaded straight into `bulkSearchReplace.search`'s `deleted`/`serviceTagIds`/`serviceAttributeIds`
  input. The column-visibility menu (`DataTable`'s only actually-built-in toolbar widget) was already
  available once the toolbar turned on — no separate work needed for it.
- **UI (columns)**: rewritten to this order — **Actions, Name, Matches, Service Tags, Attributes,
  Status, Verified, Updated, Created** — mirroring `OrganizationTable`'s column shape wherever an
  equivalent exists. Only the first five are visible by default (`hiddenByDefault: true` on Status,
  Verified, Updated, Created) — one click away in the column-visibility menu, not removed:
  - **Actions** (renamed from the old single-icon **Edit** column, moved first, `pin: 'left'`,
    `hideable: false` — same as `OrganizationTable`'s own Actions column): two distinct icons,
    mirroring `OrganizationTable`'s `RowAction` pattern (`ActionIcon` + `Link`/native anchor +
    `target='_blank'`, themed `theme.other.colors.primary.allyGreen`) rather than inventing a new
    shape. **Quick edit** (`carbon:edit`) is the pre-existing inline popover, unchanged behavior.
    **Open full edit page** (`carbon:launch`, new) navigates to the record's real edit page: an org row
    goes to `/org/[slug]/edit` via a typed `Route` object (same as `OrganizationTable`'s own edit link,
    no extra params needed); a service row goes to its location's edit page
    (`/org/[slug]/[orgLocationId]/edit`) or, if it has no active location link, the remote-services
    page (`/org/[slug]/remote/edit`) — both with a `?serviceId=` query string appended, which the
    destination page uses to auto-open that exact service's edit drawer (see below). The service link
    can't use a typed `Route` object (nextjs-routes' generated type has no slot for an arbitrary extra
    query key), so it's a plain string through a native anchor (`component='a'`) instead of the typed
    `Link` wrapper — a deliberate, narrow exception, not a pattern used anywhere else in this file.
  - **Service Tags** / **Attributes**: service rows resolve their `tagIds`/`attributeIds` arrays to
    real names via two id→label `Map`s built once per render from data this component already fetches —
    `component.ServiceSelect` (already loaded for the bulk dialog) and a **second, unfiltered**
    `fieldOpt.attributesByCategory.useQuery({})` call (deliberately not reusing the bulk dialog's
    `canAttachTo`/`requireText`-filtered eligible-subset call, since this column needs to show the name
    of _every_ attached attribute, including ones ineligible for bulk-add). Org rows render blank —
    orgs don't carry service-level tags/attributes.
  - **Status**: org rows use the exact same derivation `OrganizationTable`'s Status column already uses
    (`Published` / `ORG_UNPUBLISHED_REASON_LABELS[unpublishedReason]`); service rows render
    `Published`/`Unpublished` from the plain `published` boolean — `OrgService` has no
    unpublished-reason enum, unlike `Organization`.
  - **Verified**: unchanged for org rows (`lastVerified`); service rows now render blank — this used to
    show `updatedAt` as a stand-in (there was no dedicated Updated column yet), which is now redundant.
  - **Updated**/**Created**: new, both row types, the same `DateCell` (Luxon
    `DATETIME_SHORT`) formatting `OrganizationTable` already uses.
  - **Deleted rows** render with a plain strikethrough (`getRowStyle` → `textDecoration:
'line-through'`, no color change) — identical to `OrganizationTable`'s existing treatment, not a
    new red-text style.
  - **Name** (`size: 260`) and **Matches** (`size: 320`) both got an explicit starting width, up from
    tanstack's 150px default — Name in particular was clipping down to a couple of letters once it had
    to share the cell with the Org/Service `Badge`. Every column, including these two, was already
    user-resizable via a drag handle `DataTable` renders unconditionally on every header
    (`enableColumnResizing` is table-wide, not per-column) — the fix here is a better starting point,
    not new resize capability.
- **UI (result rows)**: master-detail — `Organization` as the parent row, that org's matching
  `OrgService` row(s) as expandable sub-rows, expanded by default whenever an org has any matching
  services. Every row has a leading checkbox, checked by default whenever that row has at least one
  eligible text match (`isTextEligible` — true for `orgDescription`/`serviceName`/
  `serviceDescription` matches, false for `orgName`/`serviceAttributes`/`serviceTags`-only matches,
  since those have nothing Replace All can rewrite); a header checkbox selects/deselects everything
  currently shown. A **Matches** column lists one line per matched field on that row (via
  `MatchesCell`), each with the search term highlighted (`HighlightedText`) — closer to a
  find-in-files result list than a single highlighted snippet.
- **UI (search form)**: a plain two-column Mantine form — **Search for** and **Replace with (optional)**
  side by side (`TextInput`×2), both always visible. Below them, six `Checkbox`es control scope —
  **Org name, Org description, Service name, Service description, Service attributes, Service tags** —
  the first four checked by default, the last two opt-in (`DEFAULT_SCOPE`). Search only runs on an
  explicit **Search** button click or Enter in the Search field (`handleSearch` sets `committed`,
  which gates the query's `enabled` flag) — not live-as-you-type.
- **UI (quick edit)**: `EditPopover`, the first of the two Actions-column icons (see above) — a
  `TextInput` (Name, service rows only) and `Textarea` (Description), pre-filled from that row's
  current values, Save/Cancel. Calls `organization.updateBasic` for org rows (`depth === 0`) or
  `service.upsert` for service rows, passing the parent org row's id as `organizationId` — the same
  single-record mutations the normal org/service edit pages already call, so this button grants no
  access beyond what a `dataPortalBasic` session already has through those pages.
- **Deep-link-and-auto-open (new)**: the Actions column's "Open full edit page" icon doesn't just link
  to the right page for a service — it also auto-opens that exact service's edit drawer once there,
  via a new `autoOpen?: boolean` prop on
  [`ServiceEditDrawer`](../../../packages/ui/components/data-portal/ServiceEditDrawer/index.tsx). A
  mount-only effect calls the drawer's own existing `useDisclosure` `open()` when `autoOpen` is true —
  no new hidden-second-instance trick needed (unlike the duplicate-service flow's own auto-open, which
  needs one only because a brand-new duplicate has no already-rendered drawer instance yet; a real,
  existing service always already has one, rendered by `ServicesInfoCard`).
  [`ServicesInfo.tsx`](../../../packages/ui/components/sections/ServicesInfo.tsx)'s `ServiceSection`
  reads `router.query.serviceId` (a plain query-string key, not a real route param nextjs-routes models
  for any page this component renders on — hence a narrow `as { serviceId?: string }` cast rather than
  widening the component's typed `useRouter<...>()` generic) and passes
  `autoOpen={service.id === serviceId}` to whichever rendered instance matches. Neither
  `[orgLocationId]/edit.tsx` nor `remote/edit.tsx` needed any change themselves — `serviceId` flows
  through the `router.query` object they already read, down into `ServicesInfoCard` without either page
  needing to know about it. **Known simplification**: a service linked to more than one location always
  deep-links to only the first active link found (`SERVICE_SELECT`'s `locations: { where: { active:
true }, take: 1 }`) — not a data gap, just an arbitrary single choice among several valid ones.
- **UI (find & replace)**: **Replace All** sits directly above the results table, disabled until
  Replace-with has text and at least one checked row is text-eligible (`eligibleReplaceCount`). Its
  handler (`handleReplaceAll`) builds one `TReplaceTextItem[]` array from every checked row that has
  a rewritable field match and calls `bulkSearchReplace.replaceText` once. On success, a notification
  reports replaced/skipped/failed counts and the search results are invalidated/refetched. There's no
  separate before/after diff screen — the Matches column's highlighted current text _is_ the preview,
  and unchecking a row before clicking Replace All _is_ the review step.
- **UI (bulk attribute / service-tag update)**: **Add / Remove Tag or Attribute** opens
  `BulkEditDialog`, scoped to whatever service-level rows are currently checked — organization-level
  rows in the selection are called out by count ("N organization(s) ... will be ignored for this
  action"), not silently dropped. Choose **Add** or **Remove**, then one value from two grouped
  `Select` options (Attributes, filtered to the v1-eligible `require*`-all-false subset via
  `fieldOpt.attributesByCategory.useQuery({ canAttachTo: ['SERVICE'], attributeActive: true })`;
  Service Tags, via the existing `component.ServiceSelect` query). Once a value is chosen, a
  **Preview** list renders one line per selected service — computed client-side from that service's
  already-loaded `attributeIds`/`tagIds` (no extra round-trip) — showing **Already has it** / **Will
  add** / **Will remove** / **No change (doesn't have it)** per row, before **Apply** ever runs. On
  Apply, a notification reports the actual added/already-had or removed counts the mutation returned.
  Both the preview and the notification were missing from the first pass that shipped this feature —
  see [Known Issues](#known-issues--gotchas) for what that looked like and how it was caught.
- **Data**: `Organization`, `OrgService`, `FreeText`/`TranslationKey`, `AttributeSupplement`,
  `ServiceTag`/`OrgServiceTag` — no new tables, only the two new `OrgService` columns above.
- **Translations**: editing a `FreeText`'s `TranslationKey` goes through the standard
  `syncDatabaseStringIfChanged` Crowdin sync, same as every other content edit in this codebase — no
  new mechanism.
- **Audit**: every write rides the existing `getAuditedClient(actorId)` extension — automatic per-row
  `AuditTrail` entries, no new audit mechanism.

## How to Use It

1. From the Organizations section's side nav, click **Bulk Search & Replace**.
2. Type into **Search for** (required) and, if planning a find & replace, **Replace with**
   (optional). Below, check which of the six fields to search — the first four (Org name, Org
   description, Service name, Service description) are checked by default; Service attributes/Service
   tags are opt-in.
3. Click **Search** (or press Enter in the Search field). Nothing queries until this happens.
4. Results list matching organizations as parent rows, with any matching services shown as expandable
   sub-rows underneath (expanded by default). Each matched field appears as its own line under
   **Matches**, with the search term highlighted; every row with a rewritable text-field match starts
   checked.
5. Each row's **Actions** column (first column, after the checkboxes) has two icons: **Quick edit**
   opens a small inline form to fix a record's wording right there (Name for service rows, Description
   for both) — adjust and **Save**. **Open full edit page** navigates to that record's real edit page
   in a new tab — an org row opens its own edit page; a service row opens the location (or remote)
   page it belongs to, with that service's own edit drawer already open, ready to go.
6. To apply one exact substitution across several matches at once: uncheck any row that shouldn't
   change (a row matched only via attributes/tags has nothing to replace and won't count either way),
   then click **Replace All**. Only Description (organizations) or Name/Description (services) on
   checked rows are rewritten; the resulting notification reports how many were replaced vs. skipped
   (nothing left to replace, changed since search) vs. failed.
7. To add or remove a service attribute/tag across several services at once: check the service rows
   that apply (organization-level rows are ignored for this action), click **Add / Remove Tag or
   Attribute**, choose Add or Remove and a value — a per-service preview appears below (already has
   it / will add / will remove / no change) — then **Apply**. A notification reports the actual
   added/already-had or removed counts.
8. The toolbar above the results table has **Service Tags** and **Attributes** filters (narrows to
   services carrying any of the selected values — an org whose own name/description happened to match
   no longer qualifies on its own once one of these is set, only a qualifying service does) and a
   deleted-records toggle (hide deleted → show only deleted → show all, cycling on each click). Only
   five of the nine columns (Actions, Name, Matches, Service Tags, Attributes) show by default — use
   the column-visibility menu there to reveal Status, Verified, Updated, or Created, or to hide any of
   the default five.

## Known Issues / Gotchas

- **Fixed same day: the bulk attribute/tag dialog originally shipped with no per-service preview and
  no success/failure notification.** The design called for seeing "already has it / will add / will
  remove / no-op" per selected service before confirming, and a result count after Apply (matching
  what Replace All already did via `showNotification`); the first pass of `BulkEditDialog` had
  neither — just a plain selected-service count, Add/Remove + a target `Select`, then a silent Apply.
  Both gaps were found while writing this doc's Known Issues section, then fixed the same day: a
  `preview` computed client-side from each selected service's already-loaded
  `attributeIds`/`tagIds` (the backend mutations already computed and returned the counts a preview
  needed — `added`/`alreadyHad`, `removed` — nothing backend-side had to change), and a
  `showNotification` call in `handleApply`'s `onSuccess`. Covered by a new automated test (see
  [Test Cases](#test-cases), row 12) that selects an attribute, asserts the "Will add" preview
  renders, clicks Apply, and asserts the notification's exact message.
- **The toolbar's Status filter was built, then removed the same day.** The first toolbar pass mirrored
  `OrganizationTable`'s organization-level Status `MultiSelect` exactly (reusing its
  `ZStatusFilter`/`STATUS_FILTER_TO_REASON` schema directly). After trying it, Service Tags/Attributes
  filters turned out to be the more useful narrowing tool for a table whose whole reason for existing
  is finding _service_-level content — Status was removed (schema param, SQL condition, and toolbar
  control all deleted, not just hidden) and replaced with the two filters described in
  [How It Works](#how-it-works). The Status _column_ is unaffected — it still exists, just hidden by
  default like three other columns now.
- **The side-nav config has no single source of truth.** `organizationsSideNav` is copy-pasted per
  page file (five now, with this feature's addition); adding or renaming a nav entry means touching
  every file, not one shared config. A `data-portal/_sideNav.ts` non-page module (Next's pages router
  ignores `_`-prefixed files), parameterized by which page is active, would remove this — not built as
  part of this feature.
- **No automated test covers the `autoOpen`/`serviceId` deep-link wiring itself** —
  `ServiceEditDrawer`/`ServicesInfo.tsx` have no test file today (a pre-existing gap
  `duplicate-service.md` already documents for the same two files), so this feature's new capability
  stays manual QA, consistent with everything else already true of those files. `BulkSearchReplaceTable`'s
  own tests do cover that the _link itself_ is built correctly (see Test Cases row 23).
- **A service linked to more than one location always deep-links to only the first active one found**
  (`SERVICE_SELECT`'s `locations: { where: { active: true }, take: 1 }`) — the "Open full edit page"
  icon has no way to offer a choice between locations today; an arbitrary but stable pick, not a data
  loss.
- **`TableToolbarToggle` (the shared deleted-toggle component both this table and `OrganizationTable`
  use) has no accessible name** — its `ActionIcon` has no `aria-label`, and Mantine's `Tooltip` doesn't
  supply one either, so it can't be reliably targeted by role+name in an automated test. Discovered
  while writing this feature's toolbar test, which works around it by asserting the _default_
  `deleted: false` value threads into the search query on initial render, rather than simulating a
  click on the toggle itself. Pre-existing in `OrganizationTable` too, not introduced by this feature —
  worth a real `aria-label` fix there someday, benefiting both tables at once.
- **Service-level attribute/tag search is a materialized-array lookup, not a live join** —
  `OrgService.attributeIds`/`.tagIds` are kept in sync by the same two triggers that already
  maintained `Organization`'s equivalents, extended (not replaced) by this feature's migration. If
  those triggers are ever bypassed (a raw SQL write that skips them), the search index for that row
  goes stale until the next attribute/tag change on it — the same class of risk `Organization`'s
  existing arrays already carry, not new to this feature.
- **`packages/api` has a real but deliberately narrow test runner** — `packages/api/vitest.config.mts`
  - `packages/api/test/setup.ts` (new), with one test file,
    `packages/api/lib/middleware/permissions.test.ts` (6 tests, all passing), scoped specifically to the
    permission-gating logic every new procedure here depends on. It does not run against a real
    database and does not invoke the actual procedures end-to-end — it asserts the shared
    `checkPermissions` function directly, with the exact `hasPerm` shapes this feature's procedures use.
    Every other backend test case in the table below (trigram match quality, Crowdin rollback on
    partial batch failure, the changed-since-search race, audit trail entries) remains manual QA.
- **The `next-i18next/pages` import doesn't resolve under Vitest by default** — discovered while
  writing `BulkSearchReplaceTable.test.tsx`, since `BulkEditDialog` imports `useTranslation` from it.
  Fixed once, for every future `packages/ui` test, via a `resolve.alias` entry in
  `packages/ui/vitest.config.mts` mapping it to `react-i18next` directly (the real `I18nextProvider`
  `test-utils.tsx` already sets up works against that hook the same way).
- **Open question, unchanged from the original design**: keyword vocabulary — no suggested/canned
  searches (e.g. a maintained list of "outdated" terms) ship in v1; free-text entry only.
- **Open question, unchanged from the original design**: no extra friction exists for sensitive
  substitutions (e.g. crisis-related terminology) beyond the normal Matches-column preview and
  per-row checkbox review — not designed, flagged here so it isn't silently dropped if this is
  revisited.
- **Migration drift note, confirmed during this implementation**: applying this migration via
  `prisma migrate dev` reports pre-existing, unrelated drift (an untracked `SearchSynonym` table, an
  `InternalNote` FK change) and offers `migrate reset`, which wipes local data — **don't run that.**
  The path that worked without data loss: `prisma migrate deploy`
  (`pnpm --filter @weareinreach/db db:deploy`), which applies pending migration files as plain SQL
  with no drift/shadow-DB check. Confirmed after applying: `prisma migrate status` reports up to date,
  and `prisma migrate diff --from-schema prisma/schema.prisma --to-config-datasource` reports "No
  difference detected" — the live database and `schema.prisma` agree exactly, drift included.

## Test Cases

**UI** rows are real, passing tests
(`packages/ui/components/data-portal/BulkSearchReplaceTable.test.tsx`, Vitest + Testing Library, 12 tests).
**Backend** rows are manual QA except where noted — `packages/api/lib/middleware/permissions.test.ts`
(6 tests, passing) covers the permission-gating mechanism directly, not each procedure end-to-end;
everything else backend-side has no automated coverage (no real-database test runner exists in
`packages/api` yet).

| #   | Setup                                                                                                                                                    | Action                                                     | Expected result                                                                                                                                                                                                                                                                                                                                 | Layer                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Default page load                                                                                                                                        | —                                                          | The four text checkboxes (Org name, Org description, Service name, Service description) are checked; Service attributes/tags are not                                                                                                                                                                                                            | **UI — automated**                                                                                                                         |
| 2   | Search field empty                                                                                                                                       | —                                                          | Search button is disabled; no query fires (`enabled: false`)                                                                                                                                                                                                                                                                                    | **UI — automated**                                                                                                                         |
| 3   | Search field has text                                                                                                                                    | Type text, click Search                                    | Search button becomes enabled; query fires with `enabled: true` and the typed search term                                                                                                                                                                                                                                                       | **UI — automated**                                                                                                                         |
| 4   | An org matches via description, a nested service matches via name                                                                                        | Click Search                                               | Both rows render with their real name/description text and their correct Matches-column field label                                                                                                                                                                                                                                             | **UI — automated**                                                                                                                         |
| 5   | A service has the search term in an attribute, not in its name/description, "Service attributes" is checked                                              | Click Search                                               | The service row appears, matched field labeled "Service attributes," and the row is _not_ pre-checked for replace eligibility (confirmed by code inspection of `isTextEligible`/the seeding effect — not covered by an automated test)                                                                                                          | UI + Backend (manual)                                                                                                                      |
| 6   | Search results showing 2 rows, both pre-checked                                                                                                          | Type Replace text, uncheck 1 row, click Replace All        | Exactly 1 row is submitted to the mutation, with the exact expected payload shape                                                                                                                                                                                                                                                               | **UI — automated**                                                                                                                         |
| 7   | Search results include a row that matched only via Service attributes/tags, currently checked                                                            | Type Replace text, click Replace All                       | That row is excluded from the submitted payload — nothing to replace                                                                                                                                                                                                                                                                            | Backend (manual)                                                                                                                           |
| 8   | Replace All clicked with Replace-with field empty                                                                                                        | —                                                          | Button is disabled; no mutation call is possible in this state                                                                                                                                                                                                                                                                                  | **UI — automated**                                                                                                                         |
| 9   | Click Edit on a result row                                                                                                                               | —                                                          | Name input (service rows) and Description textarea render pre-filled with that record's current values; Cancel discards without mutating                                                                                                                                                                                                        | UI (manual)                                                                                                                                |
| 10  | Edit form open, values changed, Save clicked                                                                                                             | —                                                          | Exactly one update mutation fires (`organization.updateBasic` or `service.upsert` depending on row depth) with the edited values                                                                                                                                                                                                                | UI + Backend (manual)                                                                                                                      |
| 11  | "Add / Remove Tag or Attribute" with nothing selected                                                                                                    | —                                                          | Button is disabled                                                                                                                                                                                                                                                                                                                              | **UI — automated**                                                                                                                         |
| 12  | Select a service row with an empty `attributeIds` array, choose Add + an eligible attribute                                                              | Open Add/Remove dialog, click Apply                        | Preview shows "Will add" before Apply; after Apply, notification reports the exact added/already-had counts the mutation returned                                                                                                                                                                                                               | **UI — automated**                                                                                                                         |
| 13  | Select 3 service rows, 1 already carries the target attribute                                                                                            | Open Add/Remove dialog, choose Add + that attribute, Apply | `bulkAttachAttribute` writes exactly 2 new `AttributeSupplement` rows, reports `added: 2, alreadyHad: 1`; preview shows 2 "Will add" + 1 "Already has it" before Apply (same preview/notification mechanism row 12 automates, a different count combination)                                                                                    | Backend (manual)                                                                                                                           |
| 14  | Select 2 service rows + 1 organization row, open Add/Remove dialog                                                                                       | —                                                          | Dialog states the organization row will be ignored for this action                                                                                                                                                                                                                                                                              | UI (manual)                                                                                                                                |
| 15  | Bulk-attach an attribute where `requireText`/`requireBoolean`/`requireData`/`requireLanguage`/`requireGeo` is `true`                                     | Apply                                                      | Handler throws `BAD_REQUEST` before any write                                                                                                                                                                                                                                                                                                   | Backend (manual)                                                                                                                           |
| 16  | A session with only `dataPortalBasic` permissions calls `checkPermissions` with any of this feature's five procedures' `hasPerm` shapes                  | —                                                          | Rejected                                                                                                                                                                                                                                                                                                                                        | **Backend — automated** (mechanism-level, `permissions.test.ts`)                                                                           |
| 17  | A session with `dataPortalManager`, `dataPortalAdmin`, or valid `root` (`@inreach.org` email)                                                            | —                                                          | Accepted                                                                                                                                                                                                                                                                                                                                        | **Backend — automated** (`permissions.test.ts`)                                                                                            |
| 18  | A `root`-permission session without an `@inreach.org` email                                                                                              | —                                                          | Rejected                                                                                                                                                                                                                                                                                                                                        | **Backend — automated** (`permissions.test.ts`)                                                                                            |
| 19  | Search term differs in case from the stored text (e.g. search "covid-19", stored text has "COVID-19")                                                    | Click Search, then Replace All                             | Match is found case-insensitively (`normalize`/`.toLowerCase()`); the inserted replacement text is exactly what was typed, not case-adjusted                                                                                                                                                                                                    | Backend (manual)                                                                                                                           |
| 20  | Every individual replace/edit/bulk-tag write that actually changes a row                                                                                 | —                                                          | Produces its own `AuditTrail` entry via `getAuditedClient`, same as every other audited mutation in this codebase                                                                                                                                                                                                                               | Backend (manual)                                                                                                                           |
| 21  | One of several selected rows fails to update mid-batch (e.g. concurrently deleted)                                                                       | Replace All                                                | Response distinguishes succeeded/skipped/failed rows — not a single all-or-nothing unit (confirmed by code: each item is independently try/caught)                                                                                                                                                                                              | Backend (manual)                                                                                                                           |
| 22  | Org row with 2+ matching services, expanded by default                                                                                                   | Click the expand/collapse chevron                          | Only that org's service sub-rows toggle; sibling orgs' expansion state is unaffected                                                                                                                                                                                                                                                            | UI (manual)                                                                                                                                |
| 23  | Search results rendered                                                                                                                                  | Click Search                                               | The named columns render in order Actions, Name, Matches, Service Tags, Attributes (and, further right, Status, Verified, Updated, Created); each row shows a "Quick edit" button and a distinct "Open full edit page" link, with the org row's link a typed route and the service row's link `/org/<slug>/<orgLocationId>/edit?serviceId=<id>` | **UI — automated**                                                                                                                         |
| 24  | A service row has attribute/tag ids that resolve via the already-loaded lookup queries                                                                   | Click Search                                               | Service Tags/Attributes columns show the real resolved names for that row; the org row's Service Tags/Attributes cells are blank                                                                                                                                                                                                                | **UI — automated**                                                                                                                         |
| 25  | An org is unpublished with a reason, its matching service is unpublished, and the org is deleted                                                         | Click Search                                               | Org row's Status cell shows the reason label (e.g. "New"); the service row's Status cell shows "Unpublished"; the org row renders with a strikethrough                                                                                                                                                                                          | **UI — automated**                                                                                                                         |
| 26  | Default page load, then choosing a value in the Service Tags filter, then the Attributes filter                                                          | Click Search, then choose one of each                      | Search fires first with `deleted: false, serviceTagIds: undefined, serviceAttributeIds: undefined`; after each choice, the next call carries the matching id array                                                                                                                                                                              | **UI — automated**                                                                                                                         |
| 27  | A service linked to two active locations                                                                                                                 | Click "Open full edit page" on that service's row          | Deep-links to the first active location link found, not a choice between them (documented simplification, see Known Issues)                                                                                                                                                                                                                     | Backend (manual)                                                                                                                           |
| 28  | Land on a location or remote edit page with `?serviceId=<id>` in the URL for a service actually listed there                                             | Page loads                                                 | That exact service's `ServiceEditDrawer` opens automatically, once, without a manual click                                                                                                                                                                                                                                                      | UI (manual — no test file exists for `ServiceEditDrawer`/`ServicesInfo.tsx`, a pre-existing gap this feature didn't fix, see Known Issues) |
| 29  | Service Tags or Attributes filter set, and an org whose own name matches the search term has no service satisfying either the filter or the search scope | Click Search                                               | That org does not appear — its own name match no longer qualifies it once a service-level filter is active (`orgDirectMatchGate`, confirmed by code inspection, not covered by an automated test)                                                                                                                                               | Backend (manual)                                                                                                                           |

## Related Files

| Path                                                                                                                                                | Purpose                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md)                                                                 | Backlog entry this doc expands on                                                                                                    |
| [`docs/DataPortal/Organizations/README.md`](./README.md)                                                                                            | Parent page doc — the existing Organization table this is a sibling nav item to, not a mode of                                       |
| [`duplicate-service.md`](./duplicate-service.md)                                                                                                    | Precedent for the `FreeText`/Crowdin edit pattern, `getAuditedClient` audit pattern, and this doc's own "Status: Implemented" format |
| `packages/db/prisma/schema.prisma` (`OrgService` `:628-670` incl. new `attributeIds`/`tagIds` `:643,645` and their Gin indexes `:668-669`)          | Schema change this feature made                                                                                                      |
| `packages/db/prisma/migrations/20260905090000_add_content_search_infra/migration.sql`                                                               | The migration itself — new columns/indexes, backfill, extended trigger functions                                                     |
| `packages/api/lib/permissions.ts` (`dataPortalManager` `:19`; `attachServiceAttribute`/`attachServiceTags` `:45-46`)                                | Where this feature's gate is defined, and the fallthrough-bug precedent this feature deliberately avoided repeating                  |
| `packages/api/lib/middleware/permissions.ts`                                                                                                        | `checkPermissions` — the function this doc's permission tests assert against directly                                                |
| `packages/api/lib/middleware/permissions.test.ts`                                                                                                   | New — 6 passing tests for the permission-gating mechanism                                                                            |
| `packages/api/vitest.config.mts` / `packages/api/test/setup.ts`                                                                                     | New — minimal test infrastructure this feature added to `packages/api`                                                               |
| `packages/api/router/bulkSearchReplace/` (`index.ts`, `query.search.{schema,handler}.ts`, `mutation.replaceText.{schema,handler}.ts`, `schemas.ts`) | New router — search and find/replace                                                                                                 |
| `packages/api/router/service/mutation.bulk{Attach,Detach}{Tags,Attribute}.{schema,handler}.ts`                                                      | New — the four bulk mutations                                                                                                        |
| `packages/api/router/service/mutation.attachServiceTags.handler.ts` / `mutation.attachServiceAttribute.handler.ts`                                  | Existing single-record precedents the bulk mutations' write logic mirrors                                                            |
| `packages/api/router/service/index.ts` / `schemas.ts`                                                                                               | New procedures registered here                                                                                                       |
| `packages/api/router/index.ts`                                                                                                                      | `bulkSearchReplace` router registered here                                                                                           |
| `packages/api/router/fieldOpt/query.attributesByCategory.handler.ts`                                                                                | Existing query the bulk dialog calls with `canAttachTo: ['SERVICE']`                                                                 |
| `packages/crowdin/api/index.ts` (`syncDatabaseStringIfChanged`, `buildContextUrl`)                                                                  | Existing Crowdin sync every text write here calls                                                                                    |
| `packages/db/lib/generateFreeText.ts` (`generateNestedFreeTextUpsert`)                                                                              | Existing helper the replace-text handler uses                                                                                        |
| `packages/db/client/extensions/auditContext.ts` (`getAuditedClient`)                                                                                | Existing audit-wrapper mechanism                                                                                                     |
| `packages/ui/components/data-portal/DataTable/index.tsx`                                                                                            | Row-selection + controlled-expansion additions (new, optional-controlled, every existing consumer unaffected)                        |
| `packages/ui/components/data-portal/OrganizationTable.tsx`                                                                                          | Reference implementation this feature's toolbar/Actions-column/Status-column/`DateCell` conventions mirror — not modified itself     |
| `packages/ui/components/data-portal/TableToolbarToggle.tsx`                                                                                         | Existing shared component, reused as-is for the deleted toggle                                                                       |
| `packages/ui/components/data-portal/BulkSearchReplaceTable.tsx`                                                                                     | The results table + search form + edit/replace/bulk wiring, plus the toolbar/columns/Actions rework                                  |
| `packages/ui/components/data-portal/BulkSearchReplaceTable.test.tsx`                                                                                | 12 passing Vitest+RTL tests                                                                                                          |
| `packages/ui/components/data-portal/ServiceEditDrawer/index.tsx`                                                                                    | New `autoOpen` prop + mount-only effect, for deep-linking straight into a specific service's drawer                                  |
| `packages/ui/components/sections/ServicesInfo.tsx`                                                                                                  | `ServiceSection` reads `router.query.serviceId` and passes `autoOpen` to the matching drawer instance                                |
| `packages/ui/components/data-portal/DataPortalPageShell.tsx`                                                                                        | Page chrome this feature's page renders inside                                                                                       |
| `apps/app/src/pages/data-portal/bulk-search-replace.tsx`                                                                                            | The page itself                                                                                                                      |
| `apps/app/src/pages/data-portal/{organizations,reviews,reports,downloads}.tsx`                                                                      | The four sibling pages whose duplicated `organizationsSideNav` array also got this feature's nav entry                               |
| `apps/app/@types/nextjs-routes.d.ts`                                                                                                                | Regenerated (`pnpm with-env ./node_modules/.bin/nextjs-routes`, run from `apps/app`) to include the new route                        |
| `packages/ui/vitest.config.mts`                                                                                                                     | `next-i18next/pages` → `react-i18next` alias added here (see Known Issues)                                                           |
| `packages/ui/test/setup.ts`                                                                                                                         | `ResizeObserver` stub added here (jsdom doesn't implement it; Mantine's overlay components call it)                                  |

---

_Last verified against code: 2026-09-05 — implemented end-to-end on branch `bulk-edit`, then reworked a
second time the same day to adopt the standard `DataTable` toolbar/column conventions and add the
deep-link-and-auto-open capability, then a third time to replace the toolbar's Status filter with
Service Tags/Attributes filters, default five of the nine columns to visible, and fix the Name/Matches
columns' clipped starting width. Update this doc's Known Issues if the side-nav single-source-of-truth
issue, the `packages/api` test-coverage gap, the `TableToolbarToggle` accessible-name gap, or the
multi-location deep-link simplification get addressed later._
