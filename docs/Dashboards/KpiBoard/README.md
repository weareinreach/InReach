# KPI Board (Dashboard)

> **Status: partially built.** Foundations + the Map tab are real, typechecked code, running against
> a live dev database. Overview and Explore are still placeholders. See **Implementation status**
> below for the exact state and how to resume. See `mockup.html` in this folder for the throwaway
> static HTML/JS concept mockup that started the discussion (client-only fake data, hand-rolled
> CSS/Chart.js/Leaflet — a shape reference, never ported directly).

> **Maintenance instruction: keep this doc resumable.** Before ending a session that touches this
> feature, update "Implementation status" (what's built/verified, what's not started/blocked, the
> resume steps) and "Gotchas" (any new bug/quirk hit while building) so a different session can pick
> up from this file alone, without replaying the conversation that produced it.

## Implementation status (as of 2026-09-24)

### Built and verified

- **Schema** (`packages/db/prisma/schema.prisma`): `KpiRegionMapping`, `DashboardManualMetric` models
  added, with `User` back-relations. **Migration has NOT been run** — these tables don't exist in
  any real database yet (see "Not started / blocked" below).
- **ID prefixes** (`packages/db/lib/idGen.ts`): `kpiRegionMapping: 'kprm'`, `dashboardManualMetric:
'dmet'` registered (required by this repo's `generateId()` convention — every Prisma model needs
  an entry here or the package fails to typecheck).
- **Permissions** (`packages/api/lib/permissions.ts`): `kpiBoard` group added —
  `kpiBoardRegionMappingWrite: 'dataPortalAdmin'`. Reads reuse the existing `dataPortalManager` key.
- **Shared data-quality module**
  ([`packages/api/router/dashboard/lib/kpiDataQualityStatus.ts`](../../../packages/api/router/dashboard/lib/kpiDataQualityStatus.ts)):
  the Good/Needs Review/Critical `CASE` SQL, exact rule documented below under "Data-quality status."
- **Backend procedures**, all registered in
  [`packages/api/router/dashboard/index.ts`](../../../packages/api/router/dashboard/index.ts):
  - `kpiBoardRegionMappingList` / `Create` / `Update` / `Delete` — CRUD against `KpiRegionMapping`.
  - `kpiBoardManualMetricUpsert` / `List` — CRUD against `DashboardManualMetric`.
  - `kpiBoardMapMarkers` — **confirmed working against a real dev database** (id/location/slug/name/
    lat-long/status, filtered by search/serviceTagIds/attributeIds/status, capped at 5,000 rows, no
    dependency on the un-migrated tables). Region filtering is intentionally NOT in this query yet
    (waits on `KpiRegionMapping` migration).
- **Frontend page**: `apps/app/src/pages/dashboards/kpi-board/index.tsx` — permission-gated, URL-synced
  Tabs (Overview/Explore/Map/Impact), one entry added to `DASHBOARDS` in
  [`apps/app/src/pages/dashboards/index.tsx`](../../../apps/app/src/pages/dashboards/index.tsx).
  - **Overview tab**: placeholder only.
  - **Explore tab**: placeholder only.
  - **Map tab**: real. `packages/ui/components/dashboard/kpi-board/KpiOrgMap.tsx` (clustered markers
    via `@googlemaps/markerclusterer`, fit-to-bounds, click → Mantine `Drawer` with a link to the org
    page), a search + status filter bar, wired to `kpiBoardMapMarkers`. Confirmed rendering real data
    end-to-end against a live dev DB.
  - **Impact tab**: partially real. Renders `kpiBoardManualMetricList` results as stat cards (will
    error until the migration runs, since `DashboardManualMetric` doesn't exist yet). No entry
    form/modal built — the mutation exists server-side, nothing calls it yet.

### Not started / blocked

- **Prisma migration not run.** This is the actual next step to unblock Impact and region mapping —
  run it deliberately (`pnpm --filter @weareinreach/db run db:migrate`, i.e. `prisma migrate dev`),
  not automatically, since it mutates a real database. Map's marker query doesn't need it.
- **Overview backend** (`kpiBoardOverview`) — not built. Design is fully decided (see below); no code
  yet.
- **Explore backend** (`kpiBoardExploreReport`, `kpiBoardExploreDrilldown`) — not built. Design
  (report-builder shape, long/tidy aggregation) is fully decided; no code yet.
- **Impact's donation/grant entry UI** — no modal/form exists yet to actually call
  `kpiBoardManualMetricUpsert`.
- **Region-mapping admin UI** — backend CRUD exists; no "manage regions" screen calls it yet.
- **GitHub release feed** (`kpiBoardEngineeringActivity`) — not built. Blocked externally on a GitHub
  PAT that doesn't exist yet (see "Flagged risks").
- **Recharts** — not yet added as a dependency; needed once Overview/Impact charts get built.

### To resume in a new session

1. Read this section, then "Gotchas discovered during implementation" below before writing new code.
2. Decide: run the migration now, or build Overview/Explore backend first (Map already proves the
   query patterns work against real data — Overview/Explore can follow the same approach).
3. Everything else in this doc below "Implementation status" is the original design reference,
   updated in place where implementation diverged from the plan (e.g. Map's marker query is
   per-location rather than per-service, since an org can span many service categories).

## Gotchas discovered during implementation

Real bugs/surprises hit while building the above — read these before writing more code in this area,
they're easy to reintroduce:

- **`OrgLocation`'s FK to `Organization` is `orgId`, not `organizationId`.** `OrgService` uses
  `organizationId`. Inconsistent across models — raw SQL isn't typechecked, so this class of bug
  won't surface until a query actually runs. `kpiDataQualityStatus.ts` had this wrong until caught by
  testing against a real query.
- **Every new Prisma model needs an entry in `packages/db/lib/idGen.ts`'s `idPrefix` object**, or
  `packages/db` fails to typecheck (`_TablesNotInIdPrefix` is an exhaustiveness check).
- **Don't run `next typegen` in this repo.** This project uses the third-party `nextjs-routes`
  package for typed routes, not Next's native `typedRoutes` feature. Running `next typegen` generates
  a competing, conflicting global augmentation under `.next/types/` that breaks `next/link`'s `href`
  typing. If `.next/types` ever exists, delete it.
- **The standalone `nextjs-routes` CLI silently writes to the wrong path when run outside a real
  `next dev`/`next build`.** It can't recover the `outDir` option from `next.config.mjs` (that option
  only lives inside a webpack-plugin closure, never on the exported config object), so it falls back
  to `<cwd>/@types/nextjs-routes.d.ts` instead of the real `src/types/nextjs-routes.d.ts` the app
  imports from. If typechecking a new page route without a running dev server, generate via the CLI,
  then manually copy its output over the real file (and delete the stray `@types` dir).
- **A `Link`'s `href` prop wants a bare string pathname (or a full `{pathname, query, hash}` object
  matching one of `nextjs-routes`'s generated `Route` union members) — not `{ pathname: <a union of
strings> }`.** Wrapping a multi-value string union inside a `{ pathname: ... }` object breaks
  `nextjs-routes`'s generated type's union distribution. Pass the bare string directly when every
  route is static (no dynamic segments).
- **Mantine's `Select` `onChange` gives `string | null`, and a TypeScript `as` cast does not convert
  `null` to `undefined` at runtime.** A tRPC-optional Zod field (`.optional()`) rejects `null` outright
  (`invalid_value` — Zod's `.optional()` allows `undefined`, not `null`; would need `.nullish()` to
  accept both). Convert explicitly with `?? undefined` before sending, not just a type assertion.
- **`useGoogleMapMarker` (the existing hook used elsewhere in the app) sets `marker.map` directly**,
  which fights `@googlemaps/markerclusterer`'s own ownership of when a marker is attached to the map.
  Don't reuse that hook for a clustered map — `KpiOrgMap.tsx` builds its own minimal marker layer
  instead, reusing only the exported `MapRenderer` piece of `GoogleMap.tsx` (the bare map+InfoWindow
  canvas), not the marker-creation logic.
- **`GoogleMap.tsx` was extended additively** (exporting its internal `MapRenderer`), not modified —
  its default export and existing `locationIds`-driven behavior are untouched, so this carries no
  regression risk to existing org-location maps elsewhere in the app.

## Motivation

The Director (and data-portal staff generally) have no aggregate view of the organization/service
directory today — only per-record editing tools and one narrow triage dashboard,
[Unpublished Status](../UnpublishedStatus/README.md). A concept mockup was produced showing the
general idea: an **Overview** of headline metrics and charts, an **Explore** tab for
filtering/searching the org directory, a **Map** tab, and an **Impact** tab blending in donations
and engineering delivery.

## Decisions made so far

Reached through scoping discussion + codebase reconnaissance (existing dashboard pattern, RBAC,
schema, and UI component inventory):

- **Access**: same gate as the existing dashboard — `dataPortalManager`/`dataPortalAdmin`/`root`,
  `has: 'some'`. No new role needed.
- **Donations**: no CRM integration exists or is planned yet. The Impact tab should be built against
  a manually-entered monthly figure (a placeholder for a future real integration), not a full CRM.
- **Engineering releases**: source from this repo's own GitHub history (merged PRs / releases), not
  an external tracker like Linear/Jira.
- **Geography ("region")**: the mockup's 6 hardcoded US regions don't reflect anything in the schema
  (only city/state/country/lat-long exist). Real regions should be **admin-configurable** — one
  shared, org-wide configuration (not per-user), defaulting to country-level grouping when nothing's
  been configured yet.
- **Data-quality status** (Good / Needs Review / Critical): no existing definition in the schema.
  First pass should be a simple, explainable rule built from existing fields (verification
  staleness, unpublished-without-reason, missing contact info), presented as tunable constants, not
  a black box — see proposed rule below.
- **Overview structure**: country sub-tabs (US/Canada/Mexico, matching the countries the existing
  views already split on) plus a combined "All" view — InReach has a meaningful presence in all
  three, not just a handful of non-US orgs, so a shared chart would bury the smaller countries.
  Regions default to timezone-based buckets nested under each country.
- **Taxonomy scope**: both `ServiceCategory`/`ServiceTag` (what services are offered) and
  `Attribute`/`AttributeCategory` (Leadership, Service Focus — who's served) are in scope for
  Overview and Explore, not just one taxonomy.
- **Donations/grants**: confirmed no CRM exists anywhere in this system. Both are tracked via the
  same generic manual-metric table, entered through one simple Director-facing form.
- **Filters**: reuse the existing Organization table's filter UI/components (category/attribute
  selects, search, toolbar conventions) rather than designing new ones.

## Overview tab: data inventory (v1 scope decided)

A full inventory of what's actually queryable today vs. what would need new data or product
changes — pulled from a deep pass over the Data Portal's existing Downloads feature and the full
schema. **V1 scope: everything.** The decision was "v1 is whatever we can do" — so every item in
"Currently possible" below ships in v1, since it's all real, queryable data today; every item in
"Wanted, but the data isn't there yet" stays out of v1 by definition, since none of it is buildable
without new data or product work first.

### A structural finding that should shape the Overview tab itself

Every one of the Data Portal's 14 existing CSV downloads
([`packages/ui/components/data-portal/DownloadTable.tsx`](../../../packages/ui/components/data-portal/DownloadTable.tsx),
surfaced at [`apps/app/src/pages/data-portal/downloads.tsx`](../../../apps/app/src/pages/data-portal/downloads.tsx))
is a **frozen, parameterless snapshot** — each procedure in
[`packages/api/router/csvDownload/`](../../../packages/api/router/csvDownload/) is
`permissionedProcedure('dataPortalManager').input(z.void()).mutation(...)`, reading a fixed
Postgres view under `packages/db/prisma/views/public/*.sql`. That's why there are two near-duplicate
"California" reports (`PublishedOrgsServicesCalifornia.sql` and `ServicesCountByCategoryCalifornia.sql`
are, despite their names, the identical query) and six different views that hardcode
`United States`/`Canada`/`Mexico`/`Other` as literal pivoted columns (e.g.
`OrganizationsCountryCounts.sql`, `ServicesCountByCountry.sql`) instead of one filterable report —
the tool can't take a parameter, so every new question becomes a new hardcoded view.
[`docs/DataPortal/Organizations/Downloads/summary.md`](../../DataPortal/Organizations/Downloads/summary.md)
already flags this page as a stopgap "expected to be retired in favor of ... a future Director's
Dashboard view" — this KPI Board is that successor. **The Overview tab should replace the pattern,
not just restyle the existing 14 reports**: real parameterized queries (state, category, attribute,
date range) instead of one-off frozen views per question.

### The concrete example: "orgs/services in part of New York state"

- **`GovDist` already has real county-level data for New York** — 62 counties as `parentId`-linked
  children of the NY state row (`packages/ui/mockData/json/fieldOpt.govDists.json`), matching NY's
  actual county count. This is populated real data, not schema potential.
- **But no org location is ever tagged at that granularity.** The address-entry UI
  ([`AddressAutocomplete/index.tsx`](../../../packages/ui/components/data-portal/AddressAutocomplete/index.tsx))
  deliberately filters its GovDist dropdown to `isPrimary: true` rows only
  (`packages/api/router/fieldOpt/query.govDistsByCountryNoSub.handler.ts`), excluding county/city
  sub-districts — so `OrgLocation.govDistId` is state-level only today, by product design, not by
  data gap.
- **County-level selection already exists for two other things**: an org's/location's/service's
  declared _coverage area_ (`ServiceArea`/`ServiceAreaDist`, via the Coverage Area modal), and
  attribute geo-scoping — just not for an org's physical address.
- **A workaround already exists at ZIP-code granularity**: `ServicesCountByCategoryByStateByPostalCode`
  (added in `packages/db/prisma/migrations/20260522_zipcode_capability_view/migration.sql`) already
  counts services down to ZIP + category — no new data needed for this one.
- **Bottom line**: sub-state reporting is achievable two ways without collecting any new geo data —
  (a) expose county-level address tagging in the org-edit flow (a real product change), or (b)
  derive sub-state grouping from what's already on every location (lat/long, ZIP — already proven
  workable by the postal-code view). Neither needs new geo data; both need new query/product work.

### Currently possible — ships in v1

- **Reach & scale**: total published orgs/services, countries/states covered — generalizes
  `OrganizationsCountByState.sql` / `ServicesCountByCountByState.sql`.
- **Publication pipeline health**: breakdown by `Organization.unpublishedReason` (`NEW`/
  `IN_PROGRESS`/`WAITING`/`INACTIVE`/`UNAFFIRMING`/`UNRESPONSIVE`) — the same data the Unpublished
  Status dashboard already triages record-by-record, shown here as an aggregate trend instead.
- **Geographic distribution**: country → state breakdown, generalized (and de-hardcoded) from the
  existing country-pivot views; ZIP-level service density already computed by the postal-code view.
- **Service category mix**: Housing/Legal/Mental Health/Medical/Food/Abortion Care via
  `ServiceCategory`/`ServiceTag` — the real, general-purpose version of
  `ServicesCountByCategoryByStateByCountry.sql` (the one existing view with no hardcoded logic).
- **Leadership & focus attributes**: % of orgs BIPOC-led/Black-led/Immigrant-led/Trans-led
  (`Attribute` category "Organization Leadership"); Service Focus attributes (trans-comm,
  lgbtq-youth-focus, BIPOC-comm, immigrant-comm, asylum-seekers, Spanish-speakers, etc.) — currently
  only surfaced via a hardcoded 6-attribute allowlist in `OrganizationsCountryCountsByAttribute.sql`;
  a real query would drop the allowlist entirely.
- **Data freshness/hygiene**: `lastVerified` staleness distribution (feeds the same Good/
  Needs-Review/Critical rule drafted below for Explore/Map); count of hidden/partial-address
  locations (`OrgLocation.addressVisibility`) as a safety-posture metric.
- **Growth over time**: monthly org/service creation trend (`Organization.createdAt`/
  `OrgService.createdAt`).
- **Crisis support capacity**: count of orgs/services flagged `Organization.crisisResource` /
  `OrgService.crisisSupportOnly`.
- **Coverage-gap analysis**: states/counties where `ServiceArea`/`ServiceAreaDist` claims coverage
  but no org is actually physically located — nothing today cross-references these two facts, but
  both already exist.
- **Open data-quality backlog**: counts of open `Report` (user-submitted issues) and `Suggestion`
  (user-submitted edits) by status — nothing today surfaces this queue at all, at any level.

### Wanted, but the data isn't there yet — out of v1 scope

- **Review-based reputation metrics** (avg rating, review volume/trend): `OrgReview.rating`,
  `toxicity`, `visible` all exist, but **no current report or view exposes rating or review count at
  all** — the one review-related download (`organizations_with_review` view) only shows a Yes/No
  "has reviews" flag.
  [`docs/DataPortal/Organizations/Downloads/summary.md`](../../DataPortal/Organizations/Downloads/summary.md)
  claims average rating and review count columns exist in this download — that claim is stale
  relative to the actual view; worth a correction whenever that doc is next revisited. This would
  need a new view/query, not new schema — the underlying data is already there.
- **Sub-state org-location precision** (see the NY example above): needs either a product change to
  the address-edit flow, or a derivation step from lat/long/ZIP against `GeoData` geometries — not a
  schema gap, but real work either way.
- **User/visitor demographics** (who InReach actually serves, as opposed to who's listed):
  `UserSurveyAll` (ethnicity, sexual orientation/gender identity, immigration status, birth year,
  origin/current country+district, reason for joining) is a fully populated, entirely untapped view
  — not referenced by any current report or anywhere in this KPI Board design so far. Whether this
  belongs on a Director's Overview at all (vs. a separate, more sensitive reporting surface, given
  the demographic sensitivity of this data) is its own open question, not just a data-availability
  one.

## Overview tab: shape (decided so far)

Structural decisions made since the inventory above — both content (v1 = everything in "Currently
possible" above) and shape are now decided:

- **Country sub-tabs, plus a combined "All" view.** InReach has a meaningful presence in all three
  countries the existing views already split on (US/Canada/Mexico) — not just a handful of non-US
  orgs — so a shared chart would bury the smaller countries under the US's much larger numbers.
  Overview gets one sub-tab per country (each showing the same metric shapes: reach/scale, category
  breakdown, freshness, growth trend) plus a combined "All" landing view with plain totals across
  all three, so there's still a single-number answer without forcing a country pick first.
- **Regions are timezone-based buckets, nested under country.** No new schema needed — this is seed
  content for the already-designed `KpiRegionMapping` table (e.g. "Eastern"/"Central"/"Mountain"/
  "Pacific" for the US, with each label's `govDistIds[]` set to the relevant states). A few US
  states straddle two zones (parts of TX/ID/MI/KY/TN) — fine for a general-region purpose, not
  something to over-engineer. The region filter UI groups by country (an optgroup or equivalent)
  rather than showing one flat list mixing US zones with Canadian/Mexican regions.
- **Both taxonomies are in scope, for different charts.** `ServiceCategory`/`ServiceTag` (Housing,
  Legal, Mental Health, Medical, Food, Abortion Care) drives the "what services are offered" chart.
  Separately, `Attribute`/`AttributeCategory`'s Organization Leadership group (BIPOC-led/Black-led/
  Immigrant-led/Trans-led) and Service Focus group (trans-comm/lgbtq-youth-focus/BIPOC-comm/
  immigrant-comm/asylum-seekers/Spanish-speakers/etc.) drive a separate "who we serve" cut. These
  are two different models — attributes attach via `AttributeSupplement`, which can link to an org,
  location, service, user, country, gov-district, or language and can carry a value, not just
  presence — different plumbing than the simpler `OrgServiceTag` join, though for Leadership/Focus
  specifically it's still just a presence count (same idea, different join).
- **Filters reuse the existing Organization table's filter UI**, not new controls — the same
  category/attribute-select, search, and toolbar conventions already established in
  `OrganizationTable.tsx`, applied here rather than invented fresh.

## Explore tab: purpose & shape (decided)

Unlike Overview (aggregate health metrics) and unlike a staff editing tool, Explore's job is **reach
reporting** — "what services exist, and where" — for external-facing needs like grant applications
and board reporting, not day-to-day record maintenance. That reframes what it should look like:

- **Primary view: a geography × tag/attribute report-builder**, not a flat filterable org list. Pick
  a geography scope (down to state or ZIP — see the geography discussion above) and one or more
  tags/attributes to break down by; the result is a counts table (geography rows × selected-tag
  columns).
- **The org/service list is a drill-down, not a parallel tab.** Clicking a cell in the report (e.g.
  "Erie County, NY — 3 trans-led orgs") opens the underlying rows for that exact geography + tag
  combination, using the same read-only row-detail pattern already planned (an `AuditDrawer`-style
  drawer, not `OrganizationTable`'s edit-oriented row actions). There's no independently-reachable
  flat org list separate from a report result.
- **One flexible tool, not two hardcoded modes.** Picking a single tag/attribute and picking several
  are the same interaction at different widths — a 1-column report vs. an N-column report — not two
  different features to build. This generalizes (and eventually replaces) the existing hardcoded
  per-attribute views (`OrganizationsCountryCountsByAttribute.sql`'s 6-attribute allowlist,
  `ServicesCountByCountryAttribute.sql`'s 17-attribute allowlist), which pivot only to country level
  and can't take a parameter — the real version drops the allowlist and supports state/ZIP
  granularity.
- **Tag/attribute picker reuses the Organization table's existing filter UI** — the same
  category/attribute-select components `OrganizationTable.tsx` already uses, not a new control
  invented for this report-builder. Covers both taxonomies (`ServiceCategory`/`ServiceTag` and
  `Attribute`/`AttributeCategory` — see "Overview tab: shape" above), same as Overview.
- **Report layout**: a control bar (geography scope selector + a "Break down by" multi-select,
  grouped by category, for the tag/attribute columns) above a report table — geography as rows,
  selected tags/attributes as columns, plus an "Export to CSV" action (the thing that actually
  retires the old frozen per-attribute downloads). This is a deliberate simplification of the
  standard BI Rows/Columns/Values pattern (Excel PivotTables, Tableau, Power BI's Matrix visual) —
  geography is fixed as rows rather than freely swappable, which fits this tool's one clear use
  case without building full spreadsheet-grade generality.
- **Aggregation strategy (decided): long/tidy data, pivoted client-side — not a wide SQL query.**
  Standard BI tools (Tableau, Power BI, Excel) don't ask the database to produce a variably-wide
  result; they fetch one row per (geography, tag) combination — a fixed shape regardless of how
  many tags are selected — and pivot it into a cross-tab in the application layer. Same approach
  here: `kpiBoardExploreReport` returns `{ geographyId, tagId, count }[]`, and the frontend reshapes
  that into the displayed table. Simpler and safer than generating dynamic `CASE WHEN` SQL per
  request (or relying on Postgres's `crosstab()` extension), easier to type in TypeScript (one fixed
  shape instead of one shape per selection count), and it leaves room to support swapping rows/
  columns later as a pure frontend change if that's ever wanted.

This supersedes the Explore-tab framing further down (a filterable/sortable org table modeled on
`forOrganizationTable`) — that query still has a role, just as the drill-down data source behind a
report cell, not as Explore's landing view.

## Map tab: shape (decided, built)

- **Filters**: search + status shipped; category/attribute filters exist on the backend
  (`serviceTagIds`/`attributeIds`) but aren't wired into the filter bar UI yet; region filtering
  waits on the `KpiRegionMapping` migration.
- **Marker query** (`kpiBoardMapMarkers`, built): one row per **(org, location)**, not per service —
  an org can span many service categories, so a marker doesn't carry a single "category" field the
  way the original design sketch assumed; category/attribute instead narrow which orgs show up.
  Returns `orgId`/`locationId`/`slug`/`name`/`latitude`/`longitude`/`status`, row-capped at 5,000
  rather than paginated.
- **Data-quality status and region scheme**: status reused as designed; region scheme not wired in
  yet (blocked on migration).
- **`GoogleMap.tsx` extended additively + `@googlemaps/markerclusterer`**: done — see "Gotchas" above
  for why `useGoogleMapMarker` wasn't reused for marker creation.
- **Pin-click detail**: a Mantine `Drawer` (not `AuditDrawer` itself, but the same read-only pattern)
  showing status + a link to the real org page.

One non-blocking flag, still unchecked: Google Maps API quota/billing should be checked with whoever
owns that budget, since this adds a new, potentially marker-heavy consumer of the same key used in
production (see "Flagged risks" below) — an ops check, not a design gap.

## Proposed design (first draft)

### Suggested build order (revised — everything is now ready except one external dependency)

1. **Phase 1 — Overview, Map, Explore, and the Impact tab's manual donations/grants entry.** All
   four are fully decided end-to-end (content, shape, layout, and query strategy) with no open
   design questions left — can proceed in any order or in parallel, and share every foundational
   piece (chart theming, region scheme, the data-quality rule, the reused filter components,
   `DashboardManualMetric`). The only non-blocking item is a Google Maps quota check before Map
   ships.
2. **Phase 2 — Impact's GitHub release feed.** Fully scoped, but blocked externally on GitHub PAT
   provisioning — an ops prerequisite, not a design gap. The rest of Impact ships in Phase 1; this
   is the one piece that waits on someone provisioning a credential.

### Data model (new)

- **`KpiRegionMapping`** — org-wide, admin-managed region definitions (`label`, `countryIds[]`,
  `govDistIds[]`). Falls back to grouping by `Country` when no rows exist, so geography breakdowns
  never start in a broken/empty state.
- **`DashboardManualMetric`** — a generic manual-KPI entry (`metricKey`, `periodStart`, `value`,
  optional `breakdown` JSON), not donation-specific, so future manual metrics don't need a schema
  migration. Confirmed use case: both donations and grant money are tracked here as two separate
  `metricKey` values (e.g. `donations-monthly-total`, `grants-monthly-total`), same table, same
  entry form. `@@unique([metricKey, periodStart])` so re-entering a month overwrites rather than
  duplicates.
- No changes needed to `Organization`/`OrgLocation`/`OrgService` — all Overview/Explore/Map queries
  can read existing fields (`createdAt`, `updatedAt`, `published`, `deleted`, `lastVerified`,
  `unpublishedReason`, `OrgLocation.latitude`/`longitude`, service category via `ServiceCategory`/
  `ServiceTag`, and the separate Leadership/Focus cut via `Attribute`/`AttributeCategory`/
  `AttributeSupplement` — see "Overview tab: shape" above for why both taxonomies matter).

### Backend

Would follow the exact existing pattern in
[`packages/api/router/dashboard/index.ts`](../../../packages/api/router/dashboard/index.ts) (flat
`dashboardRouter`, `permissionedProcedure('dataPortalManager')`, lazy `importHandler`) — new
procedures prefixed `kpiBoard*`, no new `Permission` needed for reads; region-mapping _writes_ would
use `dataPortalAdmin` (one tier stricter, since it's a shared setting affecting every viewer).

- `kpiBoardOverview` — Overview-tab aggregates (counts, category/geography breakdowns, monthly
  trend), computed as parallel queries. Mostly cheap live aggregates at expected volumes; the
  category breakdown's join fanout is worth an early `EXPLAIN ANALYZE` before assuming it stays
  cheap at scale.
- `kpiBoardExploreReport` — **new, the primary Explore query**: geography scope (country/state/ZIP)
  × a caller-selected set of tags/attributes, generalizing the existing hardcoded per-attribute
  country-pivoted views (see "Explore tab: purpose & shape" above). Returns **long/tidy rows**
  (`{ geographyId, tagId, count }[]`) rather than a pivoted wide result — same query shape
  regardless of how many tags are selected; the frontend pivots this into the displayed
  geography-rows × tag-columns table, matching how standard BI tools (Tableau, Power BI, Excel
  PivotTables) execute this rather than generating dynamic per-selection SQL.
- `kpiBoardExploreDrilldown` (formerly scoped as `kpiBoardExploreTable`) — mirrors
  [`query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts)'s
  existing filter/sort/paginate/search shape, plus a region filter and a computed (not stored)
  data-quality status filter. Now invoked only when a report cell is clicked, scoped to that exact
  geography + tag/attribute combination — not Explore's default landing query.
- `kpiBoardMapMarkers` (**built**) — a deliberately narrow, separate query, one row per (org,
  location) rather than per service (see "Map tab: shape" above for why), capped at a hard row
  ceiling rather than paginated. This is the piece that makes map aggregation genuinely server-side,
  unlike the mockup's client-side fake-data generation. Does not yet share a filter module with
  Explore's queries, since those aren't built - worth reconciling once they land.
- `kpiBoardManualMetricUpsert` / `kpiBoardManualMetricList` — upsert-based, so re-entering a month
  overwrites. Input's `metricKey` is a whitelisted enum covering both donations and grants (e.g.
  `z.enum(['donations-monthly-total', 'grants-monthly-total'])`), extendable later without a
  migration.
- `kpiBoardEngineeringActivity` — fetches merged PRs/releases via Octokit (already a monorepo
  dependency), cached briefly in the existing KV layer. **Needs a new credential**: a read-only
  fine-grained GitHub PAT for this repo, registered through `packages/env`'s validated schema (not
  an unvalidated raw `process.env` read like the one existing, narrower GitHub-token precedent in
  `packages/db/prisma/common.ts`) — a real setup prerequisite, not just a code change.
- `kpiBoardRegionMapping.{list,create,update,delete}` — `list` at `dataPortalManager` (every KPI
  query needs to resolve mappings), writes at `dataPortalAdmin`.

**Data-quality status — proposed v1 rule** (computed live via SQL `CASE`, same technique as
[`unpublishedStatusTiers.ts`](../../../packages/api/router/dashboard/lib/unpublishedStatusTiers.ts),
extracted into one shared module so Overview/Explore/Map never disagree):

- **Critical**: deleted, OR unpublished with no reason set, OR never verified and >90 days old, OR
  verified but stale >365 days.
- **Needs Review**: unpublished with a tracked reason, OR verified but stale >180 days, OR no phone
  and no website anywhere on the org or its locations.
- **Good**: everything else.

These day thresholds are explicit judgment calls (loosely modeled on Unpublished Status's own
30-day cutoff), meant to be presented as adjustable, not treated as measured/final.

### Frontend

- **Route**: one page, `apps/app/src/pages/dashboards/kpi-board/index.tsx`, gated identically to
  the existing dashboard. One new entry in the `DASHBOARDS` array in
  [`apps/app/src/pages/dashboards/index.tsx`](../../../apps/app/src/pages/dashboards/index.tsx).
- **Tabs**: Mantine `Tabs` with the tab value **and** every Explore/Map filter mirrored into the URL
  query string (`shallow: true` router pattern already used elsewhere in the app) — gives
  shareable/bookmarkable state and keeps Explore/Map filters in sync for free, since both tabs read
  and write the same query keys.
- **Chart library**: none exists in this repo today. Recommended: **Recharts** — declarative SVG
  components fit this codebase's style much better than Chart.js's canvas/config-object API, and it
  covers every chart type the mockup uses without visx/d3's from-scratch cost. Chart series colors
  should use the `dataviz` skill's validated default categorical palette, not
  `theme.other.colors.tertiary` (checked against the skill's contrast validator — fails). No dark
  mode exists anywhere in this app yet, so v1 should be light-mode only, with colors passed as props
  so a future dark mode is a palette swap, not a rewrite.
- **Explore tab**: primary view is the geography × tag/attribute report-builder (see "Explore tab:
  purpose & shape" above) — its UI is not yet designed in detail. The org/service row list — built
  on the existing generic `DataTable` engine already powering `OrganizationTable.tsx` and
  `UnpublishedStatusWorklistTable.tsx`, reusing its debounced search and server-side-pagination
  conventions rather than a new table primitive — now serves only as the drill-down result when a
  report cell is clicked, opening a read-only detail drawer modeled on `AuditDrawer.tsx`'s
  controlled pattern, not as Explore's landing view.
- **Map tab (built)**: reuses the app's existing Google Maps stack
  (`GoogleMapsProvider`/`useGoogleMaps`, the live `NEXT_PUBLIC_GOOGLE_MAPS_API` key already used for
  org-location maps) — Leaflet/OSM (as in the mockup) was rejected in favor of this. Added
  `@googlemaps/markerclusterer` for clustering.
  [`packages/ui/components/dashboard/kpi-board/KpiOrgMap.tsx`](../../../packages/ui/components/dashboard/kpi-board/KpiOrgMap.tsx)
  is a new, additive component reusing `GoogleMap.tsx`'s exported `MapRenderer` for the map canvas,
  with its own marker/clustering layer (not `useGoogleMapMarker` — see "Gotchas" above).
- **Impact tab**: stat cards (generalized from the existing count-card pattern in
  `unpublished-status/index.tsx`), a manual-entry form/modal covering both donations and grants (a
  metric-type picker over the same `DashboardManualMetric` mutation, not two separate forms),
  donation/grant and growth charts, and a simple (non-chart) GitHub release list panel.
  Region-mapping admin CRUD as a modal next to the region filter control, gated `dataPortalAdmin`.

## Flagged risks / open items

- Category-breakdown query's join fanout needs an early `EXPLAIN ANALYZE` at real data volume.
- GitHub PAT provisioning is a real external dependency — needs to be created and handed off before
  the Impact tab can ship.
- Google Maps API quota/billing should be sanity-checked with whoever owns that budget before the
  Map tab ships, since this adds a new, potentially marker-heavy internal consumer of the same key
  used in production.
- The Data Portal's CSV Downloads feature already ships a _hardcoded_ US/Canada/Mexico/Other region
  breakdown (`OrganizationsCountryCounts` view) — the same anti-pattern this feature is deliberately
  avoiding. Out of scope to fix as part of this feature, but worth knowing it exists as a second,
  inconsistent "region" concept already in the product.
- Donation-source pie chart's suitability depends on how many sources actually exist once real data
  shows up — a bar chart is the fallback if it turns out to be more than a handful.

## Related Files

| Path                                                                                                                                                        | Purpose                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `mockup.html` (this folder, added separately)                                                                                                               | Throwaway concept mockup that prompted this discussion       |
| [`docs/Dashboards/README.md`](../README.md)                                                                                                                 | The dashboards area this would join                          |
| [`docs/Dashboards/UnpublishedStatus/README.md`](../UnpublishedStatus/README.md)                                                                             | The one existing dashboard; closest precedent for this one   |
| [`packages/api/router/dashboard/index.ts`](../../../packages/api/router/dashboard/index.ts)                                                                 | Where new `kpiBoard*` procedures would be registered         |
| [`packages/api/router/organization/query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts) | Closest existing precedent for the Explore-tab table query   |
| [`packages/ui/providers/GoogleMaps.tsx`](../../../packages/ui/providers/GoogleMaps.tsx)                                                                     | Existing Google Maps context the Map tab would reuse         |
| [`packages/db/prisma/schema.prisma`](../../../packages/db/prisma/schema.prisma)                                                                             | Where `KpiRegionMapping`/`DashboardManualMetric` would go    |
| [`apps/app/src/pages/data-portal/downloads.tsx`](../../../apps/app/src/pages/data-portal/downloads.tsx)                                                     | Existing CSV Downloads page this feature succeeds            |
| [`packages/ui/components/data-portal/DownloadTable.tsx`](../../../packages/ui/components/data-portal/DownloadTable.tsx)                                     | Static catalog of the 14 existing frozen reports             |
| [`packages/api/router/csvDownload/`](../../../packages/api/router/csvDownload/)                                                                             | The existing parameterless (`z.void()`) report procedures    |
| [`packages/db/prisma/views/public/`](../../../packages/db/prisma/views/public/)                                                                             | The frozen Postgres views the CSV downloads read from        |
| [`docs/DataPortal/Organizations/Downloads/summary.md`](../../DataPortal/Organizations/Downloads/summary.md)                                                 | Existing downloads doc; flags this page as a stopgap already |
| [`packages/ui/components/data-portal/AddressAutocomplete/index.tsx`](../../../packages/ui/components/data-portal/AddressAutocomplete/index.tsx)             | Where org-location `GovDist` is limited to state-level today |
| [`apps/app/src/pages/dashboards/kpi-board/index.tsx`](../../../apps/app/src/pages/dashboards/kpi-board/index.tsx)                                           | **Built** — the page itself, all four tabs                   |
| [`packages/ui/components/dashboard/kpi-board/KpiOrgMap.tsx`](../../../packages/ui/components/dashboard/kpi-board/KpiOrgMap.tsx)                             | **Built** — the Map tab's clustered-marker component         |
| [`packages/api/router/dashboard/lib/kpiDataQualityStatus.ts`](../../../packages/api/router/dashboard/lib/kpiDataQualityStatus.ts)                           | **Built** — the shared Good/Needs Review/Critical SQL        |
| [`packages/api/router/dashboard/query.kpiBoardMapMarkers.handler.ts`](../../../packages/api/router/dashboard/query.kpiBoardMapMarkers.handler.ts)           | **Built** — the Map tab's backend query                      |
| [`packages/api/lib/permissions.ts`](../../../packages/api/lib/permissions.ts)                                                                               | **Built** — `kpiBoard` permission group                      |
| [`packages/db/lib/idGen.ts`](../../../packages/db/lib/idGen.ts)                                                                                             | **Built** — ID prefixes for the two new models               |

---

_Last updated 2026-09-24 — foundations + Map tab built and verified against a live dev database;
Overview/Explore still design-only. See "Implementation status" at the top for exact state._
