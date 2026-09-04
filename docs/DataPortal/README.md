# Data Portal

## Overview

The Data Portal is InReach's internal staff tool, now at `/data-portal` (previously
`/admin` — renamed as part of the 2026 redesign; see
[`2026-Redesign/UI_elements.md`](./2026-Redesign/UI_elements.md)). It's where staff
moderate organization data, user reviews, user-submitted reports, staff accounts,
pull CSV data exports, and (root only) run cross-org data-integrity tooling. It is
not customer-facing — access requires a signed-in account with at least
`dataPortalBasic` permission.

As of the 2026 redesign's first implementation pass, each former "tab" is now its
own standalone page/route rather than a client-side tab within one shared `/admin`
page. Each is still its own table component under
[`packages/ui/components/data-portal/`](../../packages/ui/components/data-portal/),
backed by its own tRPC router in [`packages/api/router/`](../../packages/api/router/).
There is no shared "data portal" backend module — each page is an independent
vertical slice (UI table → tRPC procedure → Prisma query), documented separately
below. The shared page chrome (`DataPortalPageShell`: header bar + left side nav,
plus `PageHeading`) has landed and is wired into every live `/data-portal/*` page.

**This docs folder's structure mirrors the four real top-level sections
`DataPortalHeaderBar` defines** (`packages/ui/components/data-portal/DataPortalHeaderBar.tsx`),
each a subfolder here, with each section's side-nav items nested one level further
in — matching where they actually live in the UI, not a flat list of former tabs:

- **[Tasks](./Tasks/README.md)** — placeholder section, no page yet.
- **[Organizations](./Organizations/README.md)** — default landing section; its own
  table plus three side-nav items, [Reviews](./Organizations/Reviews/README.md),
  [Reports](./Organizations/Reports/README.md), and
  [Downloads](./Organizations/Downloads/README.md), each in its own nested folder.
- **[Admin](./Admin/README.md)** — one real side-nav item today,
  [Manage Users](./Admin/ManageUsers/README.md) (nested the same way); "Manage
  teams" and "Properties manager" are visible but disabled, with no page behind
  them.
- **[System](./System/README.md)** — `root`-only; its one side-nav item,
  [Quicklink](./System/Quicklink/README.md), is the destination the header bar's
  "System" link routes to.

## Access tiers

Permission is hierarchical (`root` > `dataPortalAdmin` > `dataPortalManager` >
`dataPortalBasic`). Each page gates itself independently in its own
`getServerSideProps` (previously this was one shared check in
`apps/app/src/pages/admin/index.tsx`; now each page under
`apps/app/src/pages/data-portal/` owns its own):

| Section       | Page                                             | Route                        | Gated at | Notes                                                                  |
| ------------- | ------------------------------------------------ | ---------------------------- | -------- | ---------------------------------------------------------------------- |
| Tasks         | —                                                | —                            | —        | No page yet                                                            |
| Organizations | [Organizations](./Organizations/README.md)       | `/data-portal/organizations` | Basic+   | Default landing page — `/data-portal` redirects here                   |
| Organizations | [Reviews](./Organizations/Reviews/README.md)     | `/data-portal/reviews`       | Basic+   |                                                                        |
| Organizations | [Reports](./Organizations/Reports/README.md)     | `/data-portal/reports`       | Basic+   | **Server still requires Manager+** — see that doc's Known Issues       |
| Organizations | [Downloads](./Organizations/Downloads/README.md) | `/data-portal/downloads`     | Manager+ | Corrected from Admin+ as part of the route move — see that doc's notes |
| Admin         | [Manage Users](./Admin/ManageUsers/README.md)    | `/data-portal/manage-users`  | Manager+ | Renamed from "Users" to match the redesign's naming                    |
| System        | [Quicklink](./System/Quicklink/README.md)        | `/data-portal/quicklink/*`   | `root`   | Cross-org data-integrity tooling                                       |

Reports still has a UI-level permission that doesn't match what the underlying
tRPC procedure enforces (documented in its own file, since the fix belongs with the
rest of that page's implementation). Downloads' equivalent mismatch was fixed as
part of an earlier relocation, since it only required a frontend threshold change.

## Pages

- **[Organizations](./Organizations/README.md)** — the org directory's system-of-record
  table: publish status/unpublish reason, verification date, locations, and each
  org's services (including duplicating one — see
  [`Organizations/duplicate-service.md`](./Organizations/duplicate-service.md)).
  Filtering, sorting, and pagination run server-side (a prior fully client-side
  version was retired — see that doc's "How It Works").
- **[Reviews](./Organizations/Reviews/README.md)** — moderation queue for
  user-submitted org/service reviews: hide/unhide, delete/undelete.
- **[Reports](./Organizations/Reports/README.md)** — moderation queue for
  user-submitted content flags ("this listing is wrong/closed/etc.") with a status
  workflow and internal notes.
- **[Downloads](./Organizations/Downloads/README.md)** — on-demand CSV exports of
  precomputed organization/service aggregate views. See
  [`Downloads/summary.md`](./Organizations/Downloads/summary.md) for the exact SQL
  and sample output of every report.
- **[Manage Users](./Admin/ManageUsers/README.md)** — manage staff accounts' Data
  Portal permission tier and trigger password resets.
- **[Quicklink](./System/Quicklink/README.md)** — root-only bulk data-integrity
  tooling for fixing cross-org phone/email/service-location attachment problems.

## Related documentation

- [`2026-Redesign/UI_elements.md`](./2026-Redesign/UI_elements.md) — the in-progress
  redesign this rename/relocation is the first implementation pass of: target
  layout, routing decisions, and what's deferred to later phases.
- [`docs/Database/`](../Database/) — schema, models, and computed-field business
  logic referenced throughout these docs (e.g. the audit trail, `Organization`
  indexes).
- [`docs/AccessControl/`](../AccessControl/) — how the permission tiers referenced
  above (`dataPortalBasic`/`Manager`/`Admin`/`root`) are defined and checked.
- [`docs/_templates/`](../_templates/) — the doc format these files follow, and the
  reasoning behind it.

---

_Last verified against code: 2026-09-04._
